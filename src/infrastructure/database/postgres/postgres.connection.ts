import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';

@Injectable()
export class PostgresConnection {
    private static _pool?: Pool;
    private readonly _logger: Logger = new Logger(PostgresConnection.name);

    constructor(private readonly _configService: ConfigService) {}

    public async initialize(): Promise<void> {
        if (PostgresConnection._pool) {
            return;
        }
        await this._setupPool();
    }

    /**
     * Connects to the Postgres instance by creating a connection pool.
     */
    private async _setupPool(): Promise<void> {
        try {
            const host = this._getConfigurationVariable('PG_HOST');
            const port = parseInt(this._getConfigurationVariable('PG_PORT'), 10);
            const database = this._getConfigurationVariable('PG_DATABASE');
            const user = this._getConfigurationVariable('PG_USER');
            const password = this._getConfigurationVariable('PG_PASSWORD');

            this._logger.debug('Initializing Postgres connection pool...', {
                methodName: this._setupPool.name,
            });

            const pool = new Pool({
                host,
                port,
                database,
                user,
                password,
            });

            this._logger.debug('Ensuring Postgres connection...', {
                methodName: this._setupPool.name,
            });

            await this._ensureConnection(pool);

            this._logger.debug('Postgres connection successful...', {
                methodName: this._setupPool.name,
            });

            PostgresConnection._pool = pool;
        } catch (error) {
            throw new Error(
                `Failed to initialize Postgres connection: ${
                    error instanceof Error ? error.message : String(error)
                }`,
            );
        }
    }

    /**
     * Tests the Postgres connection by executing a simple query.
     *
     * If the connection cannot be established (e.g., invalid credentials),
     * this method will throw an exception.
     *
     * @param pool Postgres Pool instance
     */
    private async _ensureConnection(pool: Pool): Promise<void> {
        const result = await pool.query('SELECT 1');
        if (result.rowCount === null || result.rowCount < 1) {
            throw new Error('Postgres connection test failed.');
        }
    }

    /**
     * Retrieves a configuration variable or throws an error if it is missing.
     *
     * @param configKey The key of the configuration variable
     * @returns The value of the configuration variable
     */
    private _getConfigurationVariable(configKey: string): string {
        const configValue = this._configService.get<string>(configKey);
        if (configValue === undefined) {
            throw new Error(`Configuration variable ${configKey} is missing or empty.`);
        }
        return configValue;
    }

    /**
     * Provides the Postgres connection pool.
     *
     * @returns Postgres Pool instance
     */
    public get pool(): Pool {
        if (!PostgresConnection._pool) {
            throw new Error('Postgres connection is not initialized.');
        }
        return PostgresConnection._pool;
    }
}
