import { Inject, Injectable } from '@nestjs/common';
import { Kysely, Transaction as KyselyTransaction } from 'kysely';
import { AudioRepository } from 'src/domain/ports/repositories/audio-repository.interface';
import { PostgresDb } from '../tables';
import { PostgresTables, PostgresTransaction } from '../postgres.types';
import { PostgresMapperTokens } from '../../database.constants';
import { Mapper } from '../../types/mapper.interface';
import { Audio } from 'src/domain/entities/audio/audio.entity';
import { PostgresAudioCommand } from '../tables/postgres-audio-command.table';
import { Transaction as DomainTransaction } from 'src/domain/ports/transactions/transaction.interface';

@Injectable()
export class PostgresAudioRepository implements AudioRepository {
    private readonly _COMMANDS_TABLE = PostgresTables.AUDIO_COMMANDS;
    private readonly _DATA_TABLE = PostgresTables.AUDIO_DATA;

    constructor(
        private readonly _db: Kysely<PostgresDb>,
        @Inject(PostgresMapperTokens.AUDIO_COMMAND)
        private readonly _mapper: Mapper<Audio, PostgresAudioCommand>,
    ) {}

    public async create(audio: Audio, data: Buffer, transaction?: DomainTransaction): Promise<Audio> {
        const executor = this._getExecutor(transaction);

        const audioRecord = this._mapper.toRecord(audio);
        const dataRecord = { id: audio.id, data };

        await executor.insertInto(this._COMMANDS_TABLE).values(audioRecord).executeTakeFirst();
        await executor.insertInto(this._DATA_TABLE).values(dataRecord).executeTakeFirst();

        return audio;
    }

    public async findOneById(id: string, transaction?: DomainTransaction): Promise<Audio | undefined> {
        const executor = this._getExecutor(transaction);

        const query = executor.selectFrom(this._COMMANDS_TABLE).where('id', '=', id).selectAll();

        const audio = await query.executeTakeFirst();

        if (audio === undefined) {
            return;
        }

        const audioEntity = this._mapper.toEntity(audio);

        return audioEntity;
    }

    private _getExecutor(
        transaction?: DomainTransaction,
    ): Kysely<PostgresDb> | KyselyTransaction<PostgresDb> {
        return transaction ? (transaction as PostgresTransaction).transaction : this._db;
    }
}
