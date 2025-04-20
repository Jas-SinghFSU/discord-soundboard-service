import { Inject, Injectable } from '@nestjs/common';
import { Kysely } from 'kysely';
import { AudioRepository } from 'src/domain/ports/repositories/audio-repository.interface';
import { PostgresDb } from '../models';
import { PostgresTables } from '../postgres.types';
import { Pool } from 'pg';
import { PostgresMapperTokens } from '../../database.constants';
import { Mapper } from '../../types/mapper.interface';
import { createDb } from '../postgres.provider';
import { Audio } from 'src/domain/entities/audio/audio.entity';
import { PostgresAudioCommand } from '../models/postgres-audio-command.model';

@Injectable()
export class PostgresAudioRepository implements AudioRepository {
    private readonly _db: Kysely<PostgresDb>;
    private readonly _table = PostgresTables.AUDIO_COMMANDS;

    constructor(
        pool: Pool,
        @Inject(PostgresMapperTokens.AUDIO_COMMAND)
        private readonly _mapper: Mapper<Audio, PostgresAudioCommand>,
    ) {
        this._db = createDb(pool);
    }

    public async findOneById(id: string): Promise<Audio | undefined> {
        const query = this._db.selectFrom(this._table).where('id', '=', id).selectAll();

        const audio = await query.executeTakeFirst();

        if (audio === undefined) {
            return;
        }

        const audioEntity = this._mapper.toEntity(audio);

        return audioEntity;
    }
}
