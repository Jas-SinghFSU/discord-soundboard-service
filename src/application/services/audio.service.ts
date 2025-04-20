import { Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { Audio } from 'src/domain/entities/audio/audio.entity';
import { GetAudioInteractor } from '../interactors/audio/get-audio.interactor';

@Injectable()
export class AudioService {
    private readonly _logger: Logger = new Logger(AudioService.name);

    constructor(private readonly _getAudioInteractor: GetAudioInteractor) {}

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
                `An internal error occurred while getting command with ID ${id}: ${internalErrorMsg}`,
            );

            throw new InternalServerErrorException(
                `An unknown error occurred while getting audio command with ID: ${id}`,
            );
        }
    }

    public async searchAudio(id: string): Promise<Audio> {
        try {
            const audio = await this._getAudioInteractor.execute(id);

            if (audio === undefined) {
                throw new NotFoundException(`Failed to find the audio command with ID: ${id}`);
            }

            return audio;
        } catch (error) {
            const internalErrorMsg = error instanceof Error ? error.message : String(error);

            this._logger.error(
                `An internal error occurred while getting command with ID ${id}: ${internalErrorMsg}`,
            );

            throw new InternalServerErrorException(
                `An unknown error occurred while getting audio command with ID: ${id}`,
            );
        }
    }
}
