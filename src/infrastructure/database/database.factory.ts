import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
    DatabaseHosts,
    InstanceMap,
    ProviderMap,
    Repository,
    RepositoryFactory,
} from './types/factory.types';
import { PostgresRepositoryFactory } from './postgres/postgres.factory';

@Injectable()
export class DatabaseFactory {
    private readonly _providerMap: ProviderMap;
    private _repositoryFactory: RepositoryFactory;
    private readonly _logger: Logger = new Logger(DatabaseFactory.name);

    constructor(
        private readonly _configService: ConfigService,
        private readonly _postgresRepositoryFactory: PostgresRepositoryFactory,
    ) {
        this._providerMap = {
            [DatabaseHosts.POSTGRES]: this._postgresRepositoryFactory,
        };
    }

    public getRepository<R extends Repository>(repo: R): InstanceMap[R] {
        const providerFactory = this._getProviderFactory();
        return providerFactory.getRepo(repo);
    }

    private _getProviderFactory(): RepositoryFactory {
        if (this._repositoryFactory !== undefined) return this._repositoryFactory;

        const dbProviderConfig = this._configService.get<string>('database.type');

        this._logger.debug(`Initializing database provider based on config (${dbProviderConfig})`, {
            methodName: this._getProviderFactory.name,
        });

        let provider: RepositoryFactory;

        if (dbProviderConfig !== undefined && !DatabaseFactory.isValidDbHost(dbProviderConfig)) {
            throw new Error("Invalid 'database' environment variable.");
        }

        if (dbProviderConfig === undefined) {
            this._logger.warn(`DB Provider not found (${dbProviderConfig}). Defaulting to in-memory.`, {
                methodName: this._getProviderFactory.name,
            });
            provider = this._providerMap[DatabaseHosts.POSTGRES];
        } else {
            provider = this._providerMap[dbProviderConfig];
        }

        this._repositoryFactory = provider;

        return provider;
    }

    public static isValidDbHost(dbHost: string): dbHost is DatabaseHosts {
        return Object.values(DatabaseHosts).some((host) => dbHost === host);
    }
}
