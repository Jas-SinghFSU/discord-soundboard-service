import { Pool } from 'pg';
import { Kysely, PostgresDialect } from 'kysely';
import { createDb } from 'src/infrastructure/database/postgres/postgres.provider';

jest.mock('kysely', () => {
    return {
        Kysely: jest.fn().mockImplementation(() => ({})),
        PostgresDialect: jest.fn().mockImplementation(() => ({})),
    };
});

describe('createDb', () => {
    let mockPool: Pool;

    beforeEach(() => {
        mockPool = {} as Pool;
        jest.clearAllMocks();
    });

    it('should create a new Kysely instance with PostgresDialect', () => {
        const result = createDb(mockPool);

        expect(PostgresDialect).toHaveBeenCalledWith({ pool: mockPool });
        expect(Kysely).toHaveBeenCalledWith({
            dialect: expect.any(Object),
        });
        expect(result).toBeDefined();
    });

    it('should pass the provided pool to PostgresDialect', () => {
        createDb(mockPool);

        expect(PostgresDialect).toHaveBeenCalledWith({ pool: mockPool });
    });

    it('should return a Kysely instance', () => {
        const result = createDb(mockPool);

        expect(result).toBeInstanceOf(Object);
    });
});
