import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { DatabaseFactory } from 'src/infrastructure/database/database.factory';
import { DatabaseHosts, Repository } from 'src/infrastructure/database/types/factory.types';
import { PostgresRepositoryFactory } from 'src/infrastructure/database/postgres/postgres.factory';
import { UserRepository } from 'src/domain/ports/repositories';

describe('DatabaseFactory', () => {
    let databaseFactory: DatabaseFactory;
    let configService: ConfigService;
    let postgresRepositoryFactory: PostgresRepositoryFactory;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DatabaseFactory,
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn(),
                    },
                },
                {
                    provide: PostgresRepositoryFactory,
                    useValue: {
                        getRepo: jest.fn(),
                    },
                },
            ],
        }).compile();

        databaseFactory = module.get<DatabaseFactory>(DatabaseFactory);
        configService = module.get<ConfigService>(ConfigService);
        postgresRepositoryFactory = module.get<PostgresRepositoryFactory>(PostgresRepositoryFactory);

        jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => undefined);
        jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe('getRepository', () => {
        it('should return repository from provider factory', () => {
            const mockRepository = { id: 'mock-repo' } as unknown as UserRepository;
            jest.spyOn(postgresRepositoryFactory, 'getRepo').mockReturnValue(mockRepository);
            jest.spyOn(configService, 'get').mockReturnValue(DatabaseHosts.POSTGRES);

            const result = databaseFactory.getRepository(Repository.USER);

            expect(postgresRepositoryFactory.getRepo).toHaveBeenCalledWith(Repository.USER);
            expect(result).toBe(mockRepository);
        });

        it('should cache repository factory after first call', () => {
            const mockRepository = { id: 'mock-repo' } as unknown as UserRepository;
            jest.spyOn(postgresRepositoryFactory, 'getRepo').mockReturnValue(mockRepository);
            jest.spyOn(configService, 'get').mockReturnValue(DatabaseHosts.POSTGRES);

            databaseFactory.getRepository(Repository.USER);
            databaseFactory.getRepository(Repository.USER);

            expect(configService.get).toHaveBeenCalledTimes(1);
            expect(postgresRepositoryFactory.getRepo).toHaveBeenCalledTimes(2);
        });
    });

    describe('_getProviderFactory', () => {
        it('should return cached provider factory if available', () => {
            const mockRepository = { id: 'mock-repo' } as unknown as UserRepository;
            jest.spyOn(postgresRepositoryFactory, 'getRepo').mockReturnValue(mockRepository);
            jest.spyOn(configService, 'get').mockReturnValue(DatabaseHosts.POSTGRES);

            databaseFactory.getRepository(Repository.USER);
            databaseFactory.getRepository(Repository.USER);

            expect(configService.get).toHaveBeenCalledTimes(1);
        });

        it('should throw error if database type is invalid', () => {
            jest.spyOn(configService, 'get').mockReturnValue('INVALID_DB_TYPE');

            expect(() => databaseFactory.getRepository(Repository.USER)).toThrow(
                "Invalid 'database' environment variable.",
            );
        });

        it('should use postgres provider if database type is undefined', () => {
            const mockRepository = { id: 'mock-repo' } as unknown as UserRepository;
            jest.spyOn(postgresRepositoryFactory, 'getRepo').mockReturnValue(mockRepository);
            jest.spyOn(configService, 'get').mockReturnValue(undefined);

            const result = databaseFactory.getRepository(Repository.USER);

            expect(Logger.prototype.warn).toHaveBeenCalled();
            expect(postgresRepositoryFactory.getRepo).toHaveBeenCalledWith(Repository.USER);
            expect(result).toBe(mockRepository);
        });

        it('should use specified provider based on config', () => {
            const mockRepository = { id: 'mock-repo' } as unknown as UserRepository;
            jest.spyOn(postgresRepositoryFactory, 'getRepo').mockReturnValue(mockRepository);
            jest.spyOn(configService, 'get').mockReturnValue(DatabaseHosts.POSTGRES);

            const result = databaseFactory.getRepository(Repository.USER);

            expect(postgresRepositoryFactory.getRepo).toHaveBeenCalledWith(Repository.USER);
            expect(result).toBe(mockRepository);
        });
    });

    describe('isValidDbHost', () => {
        it('should return true for valid database host', () => {
            expect(DatabaseFactory.isValidDbHost(DatabaseHosts.POSTGRES)).toBe(true);
        });

        it('should return false for invalid database host', () => {
            expect(DatabaseFactory.isValidDbHost('INVALID_HOST')).toBe(false);
        });
    });
});
