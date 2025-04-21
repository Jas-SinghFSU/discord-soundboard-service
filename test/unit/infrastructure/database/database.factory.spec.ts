import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { UserRepository } from 'src/domain/ports/repositories';
import { AudioRepository } from 'src/domain/ports/repositories/audio-repository.interface';
import { DatabaseFactory } from 'src/infrastructure/database/database.factory';
import { PostgresRepositoryFactory } from 'src/infrastructure/database/postgres/postgres.factory';
import { DatabaseProviders } from 'src/infrastructure/database/types/factory.types';

describe('DatabaseFactory', () => {
    let databaseFactory: DatabaseFactory;
    let mockConfigService: Partial<ConfigService>;
    let mockPostgresRepositoryFactory: Partial<PostgresRepositoryFactory>;
    let mockUserRepository: UserRepository;
    let mockAudioRepository: AudioRepository;

    beforeEach(async () => {
        mockUserRepository = {} as UserRepository;
        mockAudioRepository = {} as AudioRepository;

        mockPostgresRepositoryFactory = {
            getUserRepository: jest.fn().mockReturnValue(mockUserRepository),
            getAudioRepository: jest.fn().mockReturnValue(mockAudioRepository),
        };

        mockConfigService = {
            get: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                DatabaseFactory,
                {
                    provide: ConfigService,
                    useValue: mockConfigService,
                },
                {
                    provide: PostgresRepositoryFactory,
                    useValue: mockPostgresRepositoryFactory,
                },
            ],
        }).compile();

        databaseFactory = module.get<DatabaseFactory>(DatabaseFactory);

        jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => undefined);
        jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('getUserRepository', () => {
        it('should return user repository from configured provider', () => {
            (mockConfigService.get as jest.Mock).mockReturnValue(DatabaseProviders.POSTGRES);

            const repository = databaseFactory.getUserRepository();

            expect(repository).toBe(mockUserRepository);
            expect(mockConfigService.get).toHaveBeenCalledWith('database.type');
            expect(mockPostgresRepositoryFactory.getUserRepository).toHaveBeenCalled();
        });

        it('should cache provider factory after first call', () => {
            (mockConfigService.get as jest.Mock).mockReturnValue(DatabaseProviders.POSTGRES);

            databaseFactory.getUserRepository();
            databaseFactory.getUserRepository();

            expect(mockConfigService.get).toHaveBeenCalledTimes(1);
        });
    });

    describe('getAudioRepository', () => {
        it('should return audio repository from configured provider', () => {
            (mockConfigService.get as jest.Mock).mockReturnValue(DatabaseProviders.POSTGRES);

            const repository = databaseFactory.getAudioRepository();

            expect(repository).toBe(mockAudioRepository);
            expect(mockConfigService.get).toHaveBeenCalledWith('database.type');
            expect(mockPostgresRepositoryFactory.getAudioRepository).toHaveBeenCalled();
        });
    });

    describe('_getProviderFactory', () => {
        it('should default to postgres when config is undefined', () => {
            (mockConfigService.get as jest.Mock).mockReturnValue(undefined);

            databaseFactory.getUserRepository();

            expect(mockPostgresRepositoryFactory.getUserRepository).toHaveBeenCalled();
            expect(Logger.prototype.warn).toHaveBeenCalled();
        });

        it('should throw error when config is invalid', () => {
            (mockConfigService.get as jest.Mock).mockReturnValue('invalid-database-type');

            expect(() => databaseFactory.getUserRepository()).toThrowError(
                "Invalid 'database' environment variable.",
            );
        });
    });

    describe('isValidDbHost', () => {
        it('should return true for valid database host', () => {
            expect(DatabaseFactory.isValidDbHost(DatabaseProviders.POSTGRES)).toBe(true);
        });

        it('should return false for invalid database host', () => {
            expect(DatabaseFactory.isValidDbHost('invalid-host')).toBe(false);
        });
    });
});
