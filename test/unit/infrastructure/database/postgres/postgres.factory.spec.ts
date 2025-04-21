import { Test, TestingModule } from '@nestjs/testing';
import { Kysely } from 'kysely';
import { Pool } from 'pg';
import { PostgresConnection } from 'src/infrastructure/database/postgres/postgres.connection';
import { PostgresRepositoryFactory } from 'src/infrastructure/database/postgres/postgres.factory';
import { PostgresUserRepository } from 'src/infrastructure/database/postgres/repositories';
import { PostgresAudioRepository } from 'src/infrastructure/database/postgres/repositories/audio.repository';
import { PostgresDb } from 'src/infrastructure/database/postgres/tables';

describe('PostgresRepositoryFactory', () => {
    let factory: PostgresRepositoryFactory;
    let mockDb: Kysely<PostgresDb>;
    let mockConnection: Partial<PostgresConnection>;

    beforeEach(async () => {
        mockDb = {} as Kysely<PostgresDb>;

        mockConnection = {
            get db(): Kysely<PostgresDb> | undefined {
                return mockDb;
            },
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PostgresRepositoryFactory,
                {
                    provide: PostgresConnection,
                    useValue: mockConnection,
                },
            ],
        }).compile();

        factory = module.get<PostgresRepositoryFactory>(PostgresRepositoryFactory);
    });

    describe('getUserRepository', () => {
        it('should create a new user repository when none is cached', () => {
            const repository = factory.getUserRepository();

            expect(repository).toBeInstanceOf(PostgresUserRepository);
        });

        it('should return the cached user repository when available', () => {
            const firstRepo = factory.getUserRepository();

            const secondRepo = factory.getUserRepository();

            expect(secondRepo).toBe(firstRepo);
        });
    });

    describe('getAudioRepository', () => {
        it('should create a new audio repository when none is cached', () => {
            const repository = factory.getAudioRepository();

            expect(repository).toBeInstanceOf(PostgresAudioRepository);
        });

        it('should return the cached audio repository when available', () => {
            const firstRepo = factory.getAudioRepository();

            const secondRepo = factory.getAudioRepository();

            expect(secondRepo).toBe(firstRepo);
        });
    });

    describe('error handling', () => {
        it('should throw an error when pool is undefined', () => {
            const connectionWithUndefinedPool = {
                get pool(): Pool | undefined {
                    return undefined;
                },
            };

            const factoryWithUndefinedPool = new PostgresRepositoryFactory(
                connectionWithUndefinedPool as PostgresConnection,
            );

            expect(() => factoryWithUndefinedPool.getUserRepository()).toThrow(
                'Postgres connection pool is not initialized yet.',
            );
            expect(() => factoryWithUndefinedPool.getAudioRepository()).toThrow(
                'Postgres connection pool is not initialized yet.',
            );
        });
    });
});
