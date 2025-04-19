import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PostgresConnection } from '../../../../../src/infrastructure/database/postgres/postgres.connection';
import { Logger } from '@nestjs/common';
import { Pool } from 'pg';

jest.mock('pg', () => {
    const mPool = {
        query: jest.fn(),
    };
    return { Pool: jest.fn(() => mPool) };
});

jest.mock('kysely', () => {
    const mockExecute = jest.fn().mockResolvedValue(undefined);
    const mockIfNotExists = jest.fn().mockReturnValue({ execute: mockExecute });

    const mockSql = jest.fn().mockImplementation((strings) => {
        return `sql_template_${strings[0]}`;
    });

    const mockDefaultTo = jest.fn().mockImplementation(() => ({ ifNotExists: mockIfNotExists }));
    const mockNotNull = jest.fn().mockReturnValue({ defaultTo: mockDefaultTo });

    const mockColFunctions = {
        primaryKey: jest.fn().mockReturnValue({}),
        notNull: jest.fn().mockReturnValue({ defaultTo: mockDefaultTo }),
    };

    const mockAddColumn = jest.fn().mockImplementation((_name, _type, colCallback) => {
        if (colCallback !== undefined) {
            colCallback(mockColFunctions);
        }

        return {
            addColumn: mockAddColumn,
            ifNotExists: mockIfNotExists,
        };
    });

    const mockCreateTable = jest.fn().mockReturnValue({
        addColumn: mockAddColumn,
    });

    const mockSchema = { createTable: mockCreateTable };

    const mKysely = jest.fn().mockImplementation(() => ({
        schema: mockSchema,
    }));

    return {
        Kysely: mKysely,
        PostgresDialect: jest.fn(),
        sql: mockSql,

        mockExecute,
        mockIfNotExists,
        mockDefaultTo,
        mockNotNull,
        mockColFunctions,
        mockAddColumn,
        mockCreateTable,
    };
});

describe('PostgresConnection', () => {
    let connection: PostgresConnection;
    let configService: ConfigService;
    let poolInstance: Pool;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PostgresConnection,
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn(),
                    },
                },
            ],
        }).compile();

        connection = module.get<PostgresConnection>(PostgresConnection);
        configService = module.get<ConfigService>(ConfigService);
        poolInstance = new Pool();

        jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => undefined);

        jest.clearAllMocks();
    });

    afterEach(() => {
        jest.clearAllMocks();

        const connectionConstructor = PostgresConnection as unknown as { _pool?: Pool };
        connectionConstructor._pool = undefined;
    });

    describe('initialize', () => {
        it('should successfully initialize when config is valid', async () => {
            const configValues: Record<string, string> = {
                'database.host': 'localhost',
                'database.port': '5432',
                'database.name': 'testdb',
                'database.user': 'testuser',
                'database.password': 'testpass',
            };

            jest.spyOn(configService, 'get').mockImplementation(
                (key: string) => configValues[key as keyof typeof configValues],
            );
            (poolInstance.query as jest.Mock).mockResolvedValue({ rowCount: 1 });

            await connection.initialize();

            expect(Pool).toHaveBeenCalledWith({
                host: 'localhost',
                port: 5432,
                database: 'testdb',
                user: 'testuser',
                password: 'testpass',
            });

            expect(() => connection.pool).not.toThrow();
        });

        it('should not re-initialize if already initialized', async () => {
            const configValues: Record<string, string> = {
                'database.host': 'localhost',
                'database.port': '5432',
                'database.name': 'testdb',
                'database.user': 'testuser',
                'database.password': 'testpass',
            };

            jest.spyOn(configService, 'get').mockImplementation(
                (key: string) => configValues[key as keyof typeof configValues],
            );
            (poolInstance.query as jest.Mock).mockResolvedValue({ rowCount: 1 });

            await connection.initialize();

            jest.clearAllMocks();

            await connection.initialize();

            expect(Pool).not.toHaveBeenCalled();
        });

        it('should throw an error when configuration is missing', async () => {
            jest.spyOn(configService, 'get').mockReturnValue(undefined);

            await expect(connection.initialize()).rejects.toThrow(
                /Configuration variable .* is missing or empty/,
            );
        });

        it('should throw an error when connection test fails', async () => {
            const configValues: Record<string, string> = {
                'database.host': 'localhost',
                'database.port': '5432',
                'database.name': 'testdb',
                'database.user': 'testuser',
                'database.password': 'testpass',
            };

            jest.spyOn(configService, 'get').mockImplementation(
                (key: string) => configValues[key as keyof typeof configValues],
            );

            (poolInstance.query as jest.Mock).mockResolvedValue({ rowCount: 0 });

            await expect(connection.initialize()).rejects.toThrow(/Failed to initialize Postgres connection/);
        });

        it('should create tables with all columns during initialization', async () => {
            const configValues: Record<string, string> = {
                'database.host': 'localhost',
                'database.port': '5432',
                'database.name': 'testdb',
                'database.user': 'testuser',
                'database.password': 'testpass',
            };

            jest.spyOn(configService, 'get').mockImplementation(
                (key: string) => configValues[key as keyof typeof configValues],
            );
            (poolInstance.query as jest.Mock).mockResolvedValue({ rowCount: 1 });

            const { sql, mockColFunctions, mockDefaultTo, mockAddColumn, mockIfNotExists, mockExecute } =
                jest.requireMock('kysely');

            await connection.initialize();

            expect(sql).toHaveBeenCalledTimes(2);

            expect(mockAddColumn).toHaveBeenCalledWith('id', 'text', expect.any(Function));
            expect(mockAddColumn).toHaveBeenCalledWith('username', 'text', expect.any(Function));
            expect(mockAddColumn).toHaveBeenCalledWith('display_name', 'text', expect.any(Function));
            expect(mockAddColumn).toHaveBeenCalledWith('avatar', 'text');
            expect(mockAddColumn).toHaveBeenCalledWith('provider', 'text', expect.any(Function));
            expect(mockAddColumn).toHaveBeenCalledWith('entry_audio', 'text');
            expect(mockAddColumn).toHaveBeenCalledWith('volume', 'integer', expect.any(Function));
            expect(mockAddColumn).toHaveBeenCalledWith('play_on_entry', 'boolean', expect.any(Function));

            const favoritesCall = mockAddColumn.mock.calls.find((call: string[]) => call[0] === 'favorites');
            expect(favoritesCall).toBeDefined();
            expect(favoritesCall[1]).toContain('sql_template_');

            expect(mockColFunctions.notNull).toHaveBeenCalled();
            expect(mockDefaultTo).toHaveBeenCalled();

            const sqlDefaultToCall = mockDefaultTo.mock.calls.find(
                (call: string[]) => typeof call[0] === 'string' && call[0].includes('sql_template_'),
            );
            expect(sqlDefaultToCall).toBeDefined();

            expect(mockIfNotExists).toHaveBeenCalled();
            expect(mockExecute).toHaveBeenCalled();
        });
    });

    describe('pool getter', () => {
        it('should throw an error if accessed before initialization', () => {
            expect(() => connection.pool).toThrow('Postgres connection is not initialized.');
        });

        it('should return the pool after successful initialization', async () => {
            const configValues: Record<string, string> = {
                'database.host': 'localhost',
                'database.port': '5432',
                'database.name': 'testdb',
                'database.user': 'testuser',
                'database.password': 'testpass',
            };

            jest.spyOn(configService, 'get').mockImplementation(
                (key: string) => configValues[key as keyof typeof configValues],
            );
            (poolInstance.query as jest.Mock).mockResolvedValue({ rowCount: 1 });

            const connectionConstructor = PostgresConnection as unknown as { _pool?: Pool };
            connectionConstructor._pool = poolInstance;

            const result = connection.pool;

            expect(result).toBe(poolInstance);
        });
    });
});
