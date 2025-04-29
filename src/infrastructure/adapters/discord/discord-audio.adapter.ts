import { Inject, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Client, GatewayIntentBits, VoiceChannel } from 'discord.js';
import { ConfigService } from '@nestjs/config';
import { EventBus } from 'src/domain/ports/events/event-bus.interface';
import { AudioEvents } from 'src/domain/events/audio/audio.types';
import { AudioPlayRequestedPayload, AudioPlayFinishedPayload } from 'src/domain/events/audio/audio.events';
import { AudioRepository } from 'src/domain/ports/repositories/audio-repository.interface';
import { Readable } from 'stream';
import {
    joinVoiceChannel,
    createAudioPlayer,
    createAudioResource,
    AudioPlayerStatus,
    VoiceConnection,
    AudioPlayer,
    AudioResource,
    VoiceConnectionStatus,
} from '@discordjs/voice';
import { EVENT_BUS } from 'src/infrastructure/event/event.constants';
import { RepositoryTokens } from 'src/infrastructure/database/database.constants';

/**
 * Adapter that connects the application's domain events to Discord's voice functionality.
 *
 * Listens for audio playback events from the domain layer and translates them into Discord
 * voice channel operations.
 */
@Injectable()
export class DiscordAudioAdapter implements OnModuleInit {
    private readonly _logger: Logger = new Logger(DiscordAudioAdapter.name);
    private readonly _client: Client;
    private _currentPlayer: AudioPlayer | null = null;
    private _currentConnection: VoiceConnection | null = null;

    /**
     * Creates a new Discord audio adapter.
     *
     * @param _configService - Provides access to application configuration
     * @param _eventBus - Event bus for subscribing to domain events
     * @param _audioRepository - Repository for accessing audio binary data
     */
    constructor(
        private readonly _configService: ConfigService,

        @Inject(EVENT_BUS)
        private readonly _eventBus: EventBus,

        @Inject(RepositoryTokens.AUDIO)
        private readonly _audioRepository: AudioRepository,
    ) {
        this._client = new Client({
            intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildVoiceStates],
        });
    }

    /**
     * Initializes the Discord connection and event subscriptions.
     *
     * Called automatically by NestJS when the application starts.
     * Establishes connection to Discord and sets up event handlers.
     */
    public async onModuleInit(): Promise<void> {
        const discordClientInitialized = await this._initializeDiscordClient();

        if (!discordClientInitialized) {
            return;
        }
    }

    /**
     * Attempts to initialize and connect the Discord client.
     *
     * @returns A promise resolving to true if successful, false otherwise
     */
    private async _initializeDiscordClient(): Promise<boolean> {
        const token = this._configService.get<string>('DISCORD_BOT_TOKEN');

        if (token === undefined) {
            this._logger.error('DISCORD_BOT_TOKEN is not defined in environment variables');

            return false;
        }

        try {
            this._client.once('ready', () => {
                this._logger.log(`Discord bot logged in as ${this._client.user?.tag}`);

                this._subscribeToEvents();
            });

            await this._client.login(token);

            return true;
        } catch (error) {
            this._logger.error(
                `Failed to connect to Discord: ${error instanceof Error ? error.message : String(error)}`,
            );

            return false;
        }
    }

    /**
     * Sets up subscriptions to domain events the adapter is interested in.
     *
     * Registers handlers for audio playback requests from the application core.
     */
    private _subscribeToEvents(): void {
        this._eventBus.subscribe(AudioEvents.PLAY_REQUESTED, this._handleAudioPlayRequest.bind(this));
    }

    /**
     * Processes an audio play request event from the domain.
     *
     * Retrieves the requested audio from the repository and plays it
     * in the specified Discord voice channel, then emits a completion event.
     *
     * @param payload - Event data containing audio and channel information
     */
    private async _handleAudioPlayRequest(payload: AudioPlayRequestedPayload): Promise<void> {
        try {
            this._logger.debug(`Playing audio ${payload.audioId} in channel ${payload.channelId}`);

            const userVolume = payload?.volume ?? 100;
            const normalizedVolume = userVolume / 100;
            const audioData = await this._fetchAudioData(payload.audioId);

            if (!audioData) return;

            const channel = this._getVoiceChannel(payload.channelId);
            if (!channel) return;

            this._stopCurrentPlayback();

            await this._playAudioInChannel(channel, audioData, normalizedVolume);
            await this._publishPlaybackCompletedEvent(payload);
        } catch (error) {
            this._logger.error(
                `Error playing audio: ${error instanceof Error ? error.message : String(error)}`,
            );
        }
    }

    /**
     * Retrieves audio binary data from the repository.
     *
     * @param audioId - Unique identifier of the audio to retrieve
     * @returns The audio binary data or undefined if not found
     */
    private async _fetchAudioData(audioId: string): Promise<Buffer | undefined> {
        const audioData = await this._audioRepository.findDataById(audioId);

        if (audioData === undefined) {
            this._logger.error(`Audio data not found for ID: ${audioId}`);

            return undefined;
        }

        return audioData.data;
    }

    /**
     * Retrieves and validates a Discord voice channel.
     *
     * @param channelId - Discord channel identifier
     * @returns The voice channel or undefined if invalid
     */
    private _getVoiceChannel(channelId: string): VoiceChannel | undefined {
        const channel = this._client.channels.cache.get(channelId);

        if (!(channel instanceof VoiceChannel)) {
            this._logger.error(`Channel ${channelId} is not a regular voice channel`);

            return;
        }

        return channel;
    }

    /**
     * Emits an event indicating that audio playback has completed.
     *
     * @param originalPayload - The original request payload
     */
    private async _publishPlaybackCompletedEvent(originalPayload: AudioPlayRequestedPayload): Promise<void> {
        const finishedPayload: AudioPlayFinishedPayload = {
            audioId: originalPayload.audioId,
            volume: originalPayload.volume,
            channelId: originalPayload.channelId,
            userId: originalPayload.userId,
            duration: 0,
            timestamp: new Date(),
        };

        await this._eventBus.publish(AudioEvents.PLAY_FINISHED, finishedPayload);
    }

    /**
     * Stops any currently playing audio
     */
    private _stopCurrentPlayback(): void {
        if (this._currentPlayer) {
            this._currentPlayer.stop();
        }

        if (this._currentConnection?.state.status !== VoiceConnectionStatus.Destroyed) {
            this._currentConnection?.destroy();
        }

        this._currentPlayer = null;
        this._currentConnection = null;
    }

    /**
     * Plays audio buffer in a Discord voice channel.
     *
     * Connects to the channel, converts the buffer to a playable audio resource,
     * and returns a promise that resolves when playback completes.
     *
     * @param channel - Discord voice channel to play audio in
     * @param audioBuffer - The audio data to play
     */
    private async _playAudioInChannel(
        channel: VoiceChannel,
        audioBuffer: Buffer,
        volume: number,
    ): Promise<void> {
        try {
            this._logger.debug(`[_playAudioInChannel] Connecting to voice channel ${channel}`);

            this._currentConnection = this._connectToVoiceChannel(channel);
            this._currentPlayer = createAudioPlayer();

            const resource = this._createAudioResource(audioBuffer);

            resource.volume?.setVolume(volume);

            this._logger.debug('[_playAudioInChannel] Created audio resource...');

            this._currentConnection.subscribe(this._currentPlayer);

            this._logger.debug('[_playAudioInChannel] Playing sound...');

            this._currentPlayer.play(resource);

            return this._createPlaybackCompletionPromise(this._currentConnection, this._currentPlayer);
        } catch (error) {
            this._logger.error(
                `Failed to play audio: ${error instanceof Error ? error.message : String(error)}`,
            );

            throw error;
        }
    }

    /**
     * Establishes a connection to a Discord voice channel.
     *
     * @param channel - The voice channel to connect to
     * @returns A voice connection object
     */
    private _connectToVoiceChannel(channel: VoiceChannel): VoiceConnection {
        return joinVoiceChannel({
            channelId: channel.id,
            guildId: channel.guild.id,
            adapterCreator: channel.guild.voiceAdapterCreator,
        });
    }

    /**
     * Converts a Buffer to a Discord-compatible audio resource.
     *
     * @param audioBuffer - Binary audio data
     * @returns A playable audio resource
     */
    private _createAudioResource(audioBuffer: Buffer): AudioResource {
        const audioStream = new Readable();

        audioStream.push(audioBuffer);
        audioStream.push(null);

        return createAudioResource(audioStream, {
            inlineVolume: true,
        });
    }

    /**
     * Creates a promise that resolves when audio playback completes.
     *
     * @param connection - The voice connection
     * @param player - The audio player
     * @returns Promise that resolves on completion or rejects on error
     */
    private _createPlaybackCompletionPromise(
        connection: VoiceConnection,
        player: AudioPlayer,
    ): Promise<void> {
        return new Promise((resolve, reject) => {
            player.on(AudioPlayerStatus.Idle, () => {
                connection.destroy();

                resolve();
            });

            player.on('error', (error: Error) => {
                connection.destroy();

                reject(error);
            });
        });
    }
}
