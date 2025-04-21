import { Injectable } from '@nestjs/common';
import { RepositoryFactory, RepositoryType, RepositoryCache } from '../types/factory.types';
import { PostgresConnection } from './postgres.connection';
import { PostgresUserRepository } from './repositories/';
import { PostgresUserMapper } from '../mappers';
import { PostgresAudioCommandMapper } from '../mappers/postgres/audio.mapper';
import { PostgresAudioRepository } from './repositories/audio.repository';
import { UserRepository } from 'src/domain/ports/repositories';
import { AudioRepository } from 'src/domain/ports/repositories/audio-repository.interface';
import { Kysely } from 'kysely';
import { PostgresDb } from './tables';

@Injectable()
export class PostgresRepositoryFactory implements RepositoryFactory {
    private _repositoryCache: RepositoryCache = {
        [RepositoryType.USER]: undefined,
        [RepositoryType.AUDIO]: undefined,
    };

    constructor(private readonly _postgresConnection: PostgresConnection) {}

    public getUserRepository(): UserRepository {
        const cachedRepository = this._repositoryCache[RepositoryType.USER];

        if (cachedRepository !== undefined) {
            return cachedRepository;
        }

        const userRepo = new PostgresUserRepository(this._getDb(), new PostgresUserMapper());

        this._repositoryCache[RepositoryType.USER] = userRepo;

        return userRepo;
    }

    public getAudioRepository(): AudioRepository {
        const repositoryFromCache = this._repositoryCache[RepositoryType.AUDIO];

        if (repositoryFromCache !== undefined) {
            return repositoryFromCache;
        }

        const audioRepo = new PostgresAudioRepository(this._getDb(), new PostgresAudioCommandMapper());

        this._repositoryCache[RepositoryType.AUDIO] = audioRepo;

        return audioRepo;
    }

    private _getDb(): Kysely<PostgresDb> {
        const pool = this._postgresConnection.db;

        if (pool === undefined) {
            throw new Error('Postgres connection pool is not initialized yet.');
        }

        return pool;
    }
}
