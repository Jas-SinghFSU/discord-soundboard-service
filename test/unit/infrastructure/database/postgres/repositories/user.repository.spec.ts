import { User } from 'src/domain/entities/user/user.entity';
import { PostgresDb, PostgresUser } from 'src/infrastructure/database/postgres/tables';
import { PostgresTables } from 'src/infrastructure/database/postgres/postgres.types';
import { PostgresUserRepository } from 'src/infrastructure/database/postgres/repositories';
import { Mapper } from 'src/infrastructure/database/types/mapper.interface';
import { Kysely } from 'kysely';

describe('PostgresUserRepository', () => {
    let repository: PostgresUserRepository;
    let mockMapper: Mapper<User, PostgresUser>;
    let mockDb: Kysely<PostgresDb>;

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
        const mockExecuteTakeFirst = jest.fn();
        const mockSelectAll = jest.fn().mockReturnValue({ executeTakeFirst: mockExecuteTakeFirst });
        const mockWhere = jest.fn().mockReturnValue({ selectAll: mockSelectAll });
        const mockSelectFrom = jest.fn().mockReturnValue({ where: mockWhere });

        const mockReturningAll = jest.fn().mockReturnValue({ executeTakeFirst: mockExecuteTakeFirst });
        const mockValues = jest.fn().mockReturnValue({ returningAll: mockReturningAll });
        const mockInsertInto = jest.fn().mockReturnValue({ values: mockValues });

        mockDb = {
            selectFrom: mockSelectFrom,
            insertInto: mockInsertInto,
        } as unknown as Kysely<PostgresDb>;

        mockMapper = {
            toRecord: jest.fn().mockReturnValue(mockPostgresUser),
            toEntity: jest.fn().mockReturnValue(mockUser),
        };

        mockExecuteTakeFirst.mockResolvedValue(mockPostgresUser);

        repository = new PostgresUserRepository(mockDb, mockMapper);

        jest.clearAllMocks();
    });

    describe('create', () => {
        it('should insert a user and return the created user entity', async () => {
            const result = await repository.create(mockUser);

            expect(mockMapper.toRecord).toHaveBeenCalledWith(mockUser);
            expect(mockDb.insertInto).toHaveBeenCalledWith(PostgresTables.USERS);
            expect(result).toEqual(mockUser);
        });

        it('should throw error if insertion fails', async () => {
            (mockDb.insertInto as jest.Mock).mockImplementationOnce(() => ({
                values: jest.fn().mockReturnValue({
                    returningAll: jest.fn().mockReturnValue({
                        executeTakeFirst: jest.fn().mockResolvedValue(undefined),
                    }),
                }),
            }));

            await expect(repository.create(mockUser)).rejects.toThrow('User insertion failed.');
        });
    });

    describe('findOneByUsername', () => {
        it('should return a user when found by username', async () => {
            const result = await repository.findOneByUsername('testuser');

            expect(mockDb.selectFrom).toHaveBeenCalledWith(PostgresTables.USERS);
            expect((mockDb.selectFrom as jest.Mock).mock.results[0].value.where).toHaveBeenCalledWith(
                'username',
                '=',
                'testuser',
            );
            expect(mockMapper.toEntity).toHaveBeenCalledWith(mockPostgresUser);
            expect(result).toEqual(mockUser);
        });

        it('should return undefined when user not found by username', async () => {
            (mockDb.selectFrom as jest.Mock).mockImplementationOnce(() => ({
                where: jest.fn().mockReturnValue({
                    selectAll: jest.fn().mockReturnValue({
                        executeTakeFirst: jest.fn().mockResolvedValue(undefined),
                    }),
                }),
            }));

            const result = await repository.findOneByUsername('nonexistent');

            expect(mockDb.selectFrom).toHaveBeenCalledWith(PostgresTables.USERS);
            expect(mockMapper.toEntity).not.toHaveBeenCalled();
            expect(result).toBeUndefined();
        });
    });

    describe('findOneById', () => {
        it('should return a user when found by id', async () => {
            const result = await repository.findOneById('user-id-1');

            expect(mockDb.selectFrom).toHaveBeenCalledWith(PostgresTables.USERS);
            expect((mockDb.selectFrom as jest.Mock).mock.results[0].value.where).toHaveBeenCalledWith(
                'id',
                '=',
                'user-id-1',
            );
            expect(mockMapper.toEntity).toHaveBeenCalledWith(mockPostgresUser);
            expect(result).toEqual(mockUser);
        });

        it('should return undefined when user not found by id', async () => {
            (mockDb.selectFrom as jest.Mock).mockImplementationOnce(() => ({
                where: jest.fn().mockReturnValue({
                    selectAll: jest.fn().mockReturnValue({
                        executeTakeFirst: jest.fn().mockResolvedValue(undefined),
                    }),
                }),
            }));

            const result = await repository.findOneById('nonexistent-id');

            expect(mockDb.selectFrom).toHaveBeenCalledWith(PostgresTables.USERS);
            expect(mockMapper.toEntity).not.toHaveBeenCalled();
            expect(result).toBeUndefined();
        });
    });
});
