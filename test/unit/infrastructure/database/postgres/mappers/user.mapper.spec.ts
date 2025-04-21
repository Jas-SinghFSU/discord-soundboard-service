import { PostgresUserMapper } from 'src/infrastructure/database/mappers';
import { User } from 'src/domain/entities/user/user.entity';
import { PostgresUser } from 'src/infrastructure/database/postgres/tables';
import { CreateUserProps } from 'src/domain/entities/user/user.types';
import { getValidatedDatabaseRecord } from 'src/infrastructure/database/database-model.validator';

jest.mock('../../../../../../src/infrastructure/database/database-model.validator');

describe('PostgresUserMapper', () => {
    let mapper: PostgresUserMapper;
    const mockGetValidatedDatabaseRecord = getValidatedDatabaseRecord as jest.Mock;

    beforeEach(() => {
        mapper = new PostgresUserMapper();
        jest.clearAllMocks();
    });

    describe('toEntity', () => {
        it('should convert a database record to a User entity', async () => {
            const mockRecord = {
                id: '123',
                username: 'testuser',
                display_name: 'Test User',
                avatar: 'avatar.jpg',
                provider: 'local',
                entry_audio: 'welcome.mp3',
                volume: 0.8,
                play_on_entry: true,
                favorites: ['sound1.mp3', 'sound2.mp3'],
            };

            mockGetValidatedDatabaseRecord.mockResolvedValue(mockRecord);

            const result = await mapper.toEntity(mockRecord);

            expect(result).toBeInstanceOf(User);
            expect(result.id).toBe(mockRecord.id);
            expect(result.username).toBe(mockRecord.username);
            expect(result.displayName).toBe(mockRecord.display_name);
            expect(result.avatar).toBe(mockRecord.avatar);
            expect(result.provider).toBe(mockRecord.provider);
            expect(result.audioPreferences).toEqual({
                entryAudio: mockRecord.entry_audio,
                volume: mockRecord.volume,
                playOnEntry: mockRecord.play_on_entry,
                favorites: mockRecord.favorites,
            });
        });

        it('should validate the database record before conversion', async () => {
            const mockRecord = { id: '123' };
            await mapper.toEntity(mockRecord);

            expect(mockGetValidatedDatabaseRecord).toHaveBeenCalledWith(PostgresUser, mockRecord);
        });
    });

    describe('toRecord', () => {
        it('should convert a User entity to a database record', () => {
            const userAttributes: CreateUserProps = {
                id: '123',
                username: 'testuser',
                displayName: 'Test User',
                avatar: 'avatar.jpg',
                provider: 'local',
                audioPreferences: {
                    entryAudio: 'welcome.mp3',
                    volume: 0.8,
                    playOnEntry: true,
                    favorites: ['sound1.mp3', 'sound2.mp3'],
                },
            };
            const userEntity = User.fromData(userAttributes);

            const result = mapper.toRecord(userEntity);

            expect(result).toEqual({
                id: userAttributes.id,
                username: userAttributes.username,
                display_name: userAttributes.displayName,
                avatar: userAttributes.avatar,
                provider: userAttributes.provider,
                entry_audio: userAttributes.audioPreferences?.entryAudio,
                volume: userAttributes.audioPreferences?.volume,
                play_on_entry: userAttributes.audioPreferences?.playOnEntry,
                favorites: userAttributes.audioPreferences?.favorites,
            });
        });
    });
});
