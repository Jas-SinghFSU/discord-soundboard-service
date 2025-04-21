import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { Audio } from 'src/domain/entities/audio/audio.entity';
import { GetAudioInteractor } from '../interactors/audio/get-audio.interactor';
import { CreateAudioInteractor } from '../interactors/audio/create-audio.interactor';
import { CreateAudioCommand } from '../interactors/audio/audio-interactor.types';

@Injectable()
export class AudioService {
    private readonly _logger: Logger = new Logger(AudioService.name);

    constructor(
        private readonly _getAudioInteractor: GetAudioInteractor,
        private readonly _createAudioInteractor: CreateAudioInteractor,
    ) {}

    public async getAudio(id: string): Promise<Audio> {
        try {
            const audio = await this._getAudioInteractor.execute(id);

            if (audio === undefined) {
                throw new NotFoundException(`Failed to find the audio command with ID: ${id}`);
            }

            return audio;
        } catch (error) {
            const internalErrorMsg = error instanceof Error ? error.message : String(error);

            this._logger.error(
                `An internal error occurred while fetching audio command with ID ${id}: ${internalErrorMsg}`,
            );

            throw new InternalServerErrorException(
                `An unknown error occurred while fetching audio command with ID: ${id}`,
            );
        }
    }

    public async createAudio(command: CreateAudioCommand): Promise<Audio> {
        try {
            const createdAudioCommand = await this._createAudioInteractor.execute(command);

            return createdAudioCommand;
        } catch (error) {
            const internalErrorMsg = error instanceof Error ? error.message : String(error);

            this._logger.error(
                `An internal error occurred while creating audio command '${command.audioProps.name}': ${internalErrorMsg}`,
            );

            throw new InternalServerErrorException(
                `An unknown error occurred while creating audio command: ${command.audioProps.name}`,
            );
        }
    }
}
