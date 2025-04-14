import { Injectable } from '@nestjs/common';
import { RepositoryFactory, Repository, InstanceMap } from '../types/factory.types';
import { PostgresConnection } from './postgres.connection';
import { PostgresUserRepository } from './repositories/user.repository';
import { PostgresUserMapper } from './mappers/user.mapper';

@Injectable()
export class PostgresRepositoryFactory implements RepositoryFactory {
    private readonly _instanceMap: InstanceMap;

    constructor(private readonly _postgresConnection: PostgresConnection) {
        const pool = this._postgresConnection.pool;

        this._instanceMap = {
            [Repository.USER]: new PostgresUserRepository(pool, new PostgresUserMapper()),
        };
    }

    public getRepo<R extends Repository>(repo: R): InstanceMap[R] {
        const instance = this._instanceMap[repo];

        if (instance === undefined) {
            throw new Error(`Repository not found (${repo})`);
        }

        return instance;
    }
}
