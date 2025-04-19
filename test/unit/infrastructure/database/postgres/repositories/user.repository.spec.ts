import { Test, TestingModule } from '@nestjs/testing';
import { Pool } from 'pg';
import { User } from 'src/domain/entities/user/user.entity';
import { PostgresMapperTokens } from 'src/infrastructure/database/database.constants';
import { PostgresUser } from 'src/infrastructure/database/postgres/models';
import { PostgresTables } from 'src/infrastructure/database/postgres/postgres.types';
import { PostgresUserRepository } from 'src/infrastructure/database/postgres/repositories';
import { Mapper } from 'src/infrastructure/database/types/mapper.interface';

jest.mock('../../../../../../src/infrastructure/database/postgres/postgres.provider', () => ({
    createDb: jest.fn(() => mockDb),
}));

const mockSelectAll = jest.fn();
const mockWhere = jest.fn().mockReturnValue({ selectAll: mockSelectAll });
const mockSelectFrom = jest.fn().mockReturnValue({ where: mockWhere });
const mockExecuteTakeFirst = jest.fn();
const mockReturningAll = jest.fn().mockReturnValue({ executeTakeFirst: mockExecuteTakeFirst });
const mockValues = jest.fn().mockReturnValue({ returningAll: mockReturningAll });
const mockInsertInto = jest.fn().mockReturnValue({ values: mockValues });

const mockDb = {
    selectFrom: mockSelectFrom,
    insertInto: mockInsertInto,
};

describe('PostgresUserRepository', () => {
    let repository: PostgresUserRepository;
    let mapper: Mapper<User, PostgresUser>;

    const mockUser = {
        id: 'user-id-1',
        username: 'testuser',
        displayName: 'Test User',
        avatar: 'avatar-url',
        provider: 'test-provider',
        audioPreferences: {
            entryAudio: 'audio-url',
            volume: 75,
            playOnEntry: true,
            favorites: ['fav1', 'fav2'],
        },
    } as User;

    const mockPostgresUser: PostgresUser = {
        id: 'user-id-1',
        username: 'testuser',
        display_name: 'Test User',
        avatar: 'avatar-url',
        provider: 'test-provider',
        entry_audio: 'audio-url',
        volume: 75,
        play_on_entry: true,
        favorites: ['fav1', 'fav2'],
    };

    beforeEach(async () => {
        jest.clearAllMocks();

        mockSelectAll.mockReturnValue({ executeTakeFirst: mockExecuteTakeFirst });

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                PostgresUserRepository,
                {
                    provide: PostgresMapperTokens.USER,
                    useValue: {
                        toRecord: jest.fn().mockReturnValue(mockPostgresUser),
                        toEntity: jest.fn().mockReturnValue(mockUser),
                    },
                },
                {
                    provide: Pool,
                    useValue: {},
                },
            ],
        }).compile();

        repository = module.get<PostgresUserRepository>(PostgresUserRepository);
        mapper = module.get<Mapper<User, PostgresUser>>(PostgresMapperTokens.USER);
    });

    describe('create', () => {
        it('should insert a user and return the created user entity', async () => {
            mockExecuteTakeFirst.mockResolvedValue(mockPostgresUser);

            const result = await repository.create(mockUser);

            expect(mapper.toRecord).toHaveBeenCalledWith(mockUser);
            expect(mockInsertInto).toHaveBeenCalledWith(PostgresTables.USERS);
            expect(mockValues).toHaveBeenCalledWith(mockPostgresUser);
            expect(mockReturningAll).toHaveBeenCalled();
            expect(mockExecuteTakeFirst).toHaveBeenCalled();
            expect(result).toEqual(mockUser);
        });

        it('should throw error if insertion fails', async () => {
            mockExecuteTakeFirst.mockResolvedValue(undefined);

            await expect(repository.create(mockUser)).rejects.toThrow('User insertion failed.');
        });
    });

    describe('findOneByUsername', () => {
        it('should return a user when found by username', async () => {
            mockExecuteTakeFirst.mockResolvedValue(mockPostgresUser);

            const result = await repository.findOneByUsername('testuser');

            expect(mockSelectFrom).toHaveBeenCalledWith(PostgresTables.USERS);
            expect(mockWhere).toHaveBeenCalledWith('username', '=', 'testuser');
            expect(mockSelectAll).toHaveBeenCalled();
            expect(mockExecuteTakeFirst).toHaveBeenCalled();
            expect(mapper.toEntity).toHaveBeenCalledWith(mockPostgresUser);
            expect(result).toEqual(mockUser);
        });

        it('should return undefined when user not found by username', async () => {
            mockExecuteTakeFirst.mockResolvedValue(undefined);

            const result = await repository.findOneByUsername('nonexistent');

            expect(mockSelectFrom).toHaveBeenCalledWith(PostgresTables.USERS);
            expect(mockWhere).toHaveBeenCalledWith('username', '=', 'nonexistent');
            expect(mockSelectAll).toHaveBeenCalled();
            expect(mockExecuteTakeFirst).toHaveBeenCalled();
            expect(mapper.toEntity).not.toHaveBeenCalled();
            expect(result).toBeUndefined();
        });
    });

    describe('findOneById', () => {
        it('should return a user when found by id', async () => {
            mockExecuteTakeFirst.mockResolvedValue(mockPostgresUser);

            const result = await repository.findOneById('user-id-1');

            expect(mockSelectFrom).toHaveBeenCalledWith(PostgresTables.USERS);
            expect(mockWhere).toHaveBeenCalledWith('id', '=', 'user-id-1');
            expect(mockSelectAll).toHaveBeenCalled();
            expect(mockExecuteTakeFirst).toHaveBeenCalled();
            expect(mapper.toEntity).toHaveBeenCalledWith(mockPostgresUser);
            expect(result).toEqual(mockUser);
        });

        it('should return undefined when user not found by id', async () => {
            mockExecuteTakeFirst.mockResolvedValue(undefined);

            const result = await repository.findOneById('nonexistent-id');

            expect(mockSelectFrom).toHaveBeenCalledWith(PostgresTables.USERS);
            expect(mockWhere).toHaveBeenCalledWith('id', '=', 'nonexistent-id');
            expect(mockSelectAll).toHaveBeenCalled();
            expect(mockExecuteTakeFirst).toHaveBeenCalled();
            expect(mapper.toEntity).not.toHaveBeenCalled();
            expect(result).toBeUndefined();
        });
    });
});
