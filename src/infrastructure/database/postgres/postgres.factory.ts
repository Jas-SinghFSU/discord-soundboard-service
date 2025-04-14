import { Injectable } from '@nestjs/common';
import { RepositoryFactory, Repository, InstanceMap } from '../types/factory.types';
import { PostgresConnection } from './postgres.connection';
import { PostgresUserRepository } from './repositories/';
import { PostgresUserMapper } from './mappers';

@Injectable()
export class PostgresRepositoryFactory implements RepositoryFactory {
    private readonly _repositoryCache = new Map<Repository, InstanceMap[Repository]>();

    constructor(private readonly _postgresConnection: PostgresConnection) {}

    public getRepo<R extends Repository>(repo: R): InstanceMap[R] {
        return this._getRepository(repo);
    }

    private _getRepository<R extends Repository>(repo: R): InstanceMap[R] {
        const repositoryFromCache = this._repositoryCache.get(repo);

        if (repositoryFromCache !== undefined) {
            return repositoryFromCache;
        }

        const pool = this._postgresConnection.pool;

        if (pool === undefined) {
            throw new Error('Postgres connection pool is not initialized yet.');
        }

        let repository: InstanceMap[R];

        switch (repo) {
            case Repository.USER:
                repository = new PostgresUserRepository(pool, new PostgresUserMapper());
                break;
            default:
                throw new Error(`Repository not implemented (${repo})`);
        }

        this._repositoryCache.set(repo, repository);

        return repository;
    }
}
