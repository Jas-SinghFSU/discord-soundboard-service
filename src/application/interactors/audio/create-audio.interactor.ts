import { Inject, Injectable } from '@nestjs/common';
import { Interactor } from '../interactor.interface';
import { Audio } from 'src/domain/entities/audio/audio.entity';
import { AudioRepository } from 'src/domain/ports/repositories/audio-repository.interface';
import { CreateAudioCommand } from './audio-interactor.types';
import { RepositoryTokens, TRANSACTION_MANAGER } from 'src/infrastructure/database/database.constants';
import { TransactionManager } from 'src/domain/ports/transactions/transaction.interface';
import { CreateAudioProps } from 'src/domain/entities/audio/audio.types';

@Injectable()
export class CreateAudioInteractor implements Interactor<CreateAudioCommand, Audio> {
    constructor(
        @Inject(RepositoryTokens.AUDIO)
        private readonly _audioRepository: AudioRepository,

        @Inject(TRANSACTION_MANAGER)
        private readonly _transactionManager: TransactionManager,
    ) {}

    public async execute(command: CreateAudioCommand): Promise<Audio> {
        const audioFileSize: number = Buffer.byteLength(command.audioFile);
        const createdBy = '127289675021811712';

        const createAudioProps: CreateAudioProps = {
            name: command.audioProps.name,
            format: command.audioProps.format,
            size: audioFileSize,
            createdBy,
        };

        const audioEntity = Audio.create(createAudioProps);

        const transaction = this._transactionManager.asTransaction(async (tx) => {
            const audio = await this._audioRepository.create(audioEntity, command.audioFile, tx);

            return audio;
        });

        return transaction;
    }
}
