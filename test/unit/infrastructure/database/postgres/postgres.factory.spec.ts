import { Test, TestingModule } from '@nestjs/testing';
import { Pool } from 'pg';
import { PostgresUserMapper } from 'src/infrastructure/database/postgres/mappers';
import { PostgresConnection } from 'src/infrastructure/database/postgres/postgres.connection';
import { PostgresRepositoryFactory } from 'src/infrastructure/database/postgres/postgres.factory';
import { PostgresUserRepository } from 'src/infrastructure/database/postgres/repositories';
import { Repository } from 'src/infrastructure/database/types/factory.types';

jest.mock('../../../../../src/infrastructure/database/postgres/repositories/user.repository.ts');
jest.mock('../../../../../src/infrastructure/database/postgres/mappers/user.mapper.ts');

describe('PostgresRepositoryFactory', () => {
    let factory: PostgresRepositoryFactory;
    let connection: PostgresConnection;
    let mockPool: Pool;

    const MockedPostgresUserRepository = PostgresUserRepository as jest.MockedClass<
        typeof PostgresUserRepository
    >;
    const MockedPostgresUserMapper = PostgresUserMapper as jest.MockedClass<typeof PostgresUserMapper>;

    beforeEach(async () => {
        mockPool = {} as Pool;

        connection = {
            pool: mockPool,
        } as PostgresConnection;

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PostgresRepositoryFactory,
                {
                    provide: PostgresConnection,
                    useValue: connection,
                },
            ],
        }).compile();

        factory = module.get<PostgresRepositoryFactory>(PostgresRepositoryFactory);

        jest.clearAllMocks();
    });

    describe('getRepo', () => {
        it('should return a PostgresUserRepository when Repository.USER is requested', () => {
            const mockUserRepo = {} as PostgresUserRepository;
            MockedPostgresUserRepository.mockImplementation(() => mockUserRepo);

            const result = factory.getRepo(Repository.USER);

            expect(result).toBe(mockUserRepo);
            expect(MockedPostgresUserRepository).toHaveBeenCalledTimes(1);
            expect(MockedPostgresUserRepository).toHaveBeenCalledWith(
                mockPool,
                expect.any(PostgresUserMapper),
            );
            expect(MockedPostgresUserMapper).toHaveBeenCalledTimes(1);
        });

        it('should return the same repository instance when called multiple times with the same repo type', () => {
            const mockUserRepo = {} as PostgresUserRepository;
            MockedPostgresUserRepository.mockImplementation(() => mockUserRepo);

            const result1 = factory.getRepo(Repository.USER);
            const result2 = factory.getRepo(Repository.USER);

            expect(result1).toBe(mockUserRepo);
            expect(result2).toBe(mockUserRepo);
            expect(MockedPostgresUserRepository).toHaveBeenCalledTimes(1);
        });

        it('should throw an error when the pool is undefined', () => {
            const connectionWithoutPool = {
                pool: undefined,
            } as unknown as PostgresConnection;

            const factoryWithoutPool = new PostgresRepositoryFactory(connectionWithoutPool);

            expect(() => factoryWithoutPool.getRepo(Repository.USER)).toThrow(
                'Postgres connection pool is not initialized yet.',
            );
        });

        it('should throw an error for unimplemented repositories', () => {
            const nonExistentRepo = 999 as unknown as Repository;

            expect(() => factory.getRepo(nonExistentRepo)).toThrow(
                `Repository not implemented (${nonExistentRepo})`,
            );
        });
    });

    describe('Type Safety', () => {
        it('should handle all repository enum cases', () => {
            expect(() => factory.getRepo(Repository.USER)).not.toThrow();

            const repoValues = Object.values(Repository).filter(
                (value): value is Repository =>
                    typeof value === 'number' &&
                    Object.values(Repository).includes(value as unknown as Repository),
            );

            repoValues.forEach((repoValue) => {
                try {
                    const repo = factory.getRepo(repoValue);

                    expect(repo).toBeDefined();
                } catch (error) {
                    if (repoValue !== Repository.USER) {
                        expect((error as Error).message).toBe(`Repository not implemented (${repoValue})`);
                    } else {
                        fail(`Repository.USER threw an unexpected error: ${error}`);
                    }
                }
            });
        });
    });
});
