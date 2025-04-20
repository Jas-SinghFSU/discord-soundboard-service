import { Test } from '@nestjs/testing';
import { User } from 'src/domain/entities/user/user.entity';
import { CreateUserProps, UserAudioPreferences } from 'src/domain/entities/user/user.types';

describe('User Entity', () => {
    const mockUserAttributes: CreateUserProps = {
        id: 'user-123',
        provider: 'discord',
        username: 'testuser',
        displayName: 'Test User',
        avatar: 'https://example.com/avatar.png',
        audioPreferences: {
            entryAudio: 'welcome.mp3',
            volume: 80,
            playOnEntry: true,
            favorites: ['sound1.mp3', 'sound2.mp3'],
        },
    };

    beforeEach(async () => {
        await Test.createTestingModule({}).compile();
    });

    describe('create', () => {
        it('should create a new user instance with provided attributes', () => {
            const user = User.create(mockUserAttributes);

            expect(user).toBeInstanceOf(User);
            expect(user.id).toBe(mockUserAttributes.id);
            expect(user.provider).toBe(mockUserAttributes.provider);
            expect(user.username).toBe(mockUserAttributes.username);
            expect(user.displayName).toBe(mockUserAttributes.displayName);
            expect(user.avatar).toBe(mockUserAttributes.avatar);
            expect(user.audioPreferences).toEqual(mockUserAttributes.audioPreferences);
        });

        it('should create a user with default audio preferences when not provided', () => {
            const userPropsWithoutAudio = { ...mockUserAttributes };
            delete userPropsWithoutAudio.audioPreferences;

            const user = User.create(userPropsWithoutAudio);

            expect(user.audioPreferences).toEqual({
                entryAudio: null,
                volume: 100,
                playOnEntry: false,
                favorites: [],
            });
        });

        it('should set avatar to null when not provided', () => {
            const userPropsWithoutAvatar = { ...mockUserAttributes };
            delete userPropsWithoutAvatar.avatar;

            const user = User.create(userPropsWithoutAvatar);

            expect(user.avatar).toBeNull();
        });
    });

    describe('fromData', () => {
        it('should create a user instance from stored data', () => {
            const user = User.fromData(mockUserAttributes);

            expect(user).toBeInstanceOf(User);
            expect(user.id).toBe(mockUserAttributes.id);
            expect(user.provider).toBe(mockUserAttributes.provider);
            expect(user.username).toBe(mockUserAttributes.username);
            expect(user.displayName).toBe(mockUserAttributes.displayName);
            expect(user.avatar).toBe(mockUserAttributes.avatar);
            expect(user.audioPreferences).toEqual(mockUserAttributes.audioPreferences);
        });

        it('should create a user with default audio preferences when not provided in data', () => {
            const userDataWithoutAudio = { ...mockUserAttributes };
            delete userDataWithoutAudio.audioPreferences;

            const user = User.fromData(userDataWithoutAudio);

            expect(user.audioPreferences).toEqual({
                entryAudio: null,
                volume: 100,
                playOnEntry: false,
                favorites: [],
            });
        });
    });

    describe('update', () => {
        it('should update the username when provided', () => {
            const user = User.create(mockUserAttributes);
            const newUsername = 'newusername';

            user.update({ username: newUsername });

            expect(user.username).toBe(newUsername);
        });

        it('should update the displayName when provided', () => {
            const user = User.create(mockUserAttributes);
            const newDisplayName = 'New Display Name';

            user.update({ displayName: newDisplayName });

            expect(user.displayName).toBe(newDisplayName);
        });

        it('should update the avatar when provided', () => {
            const user = User.create(mockUserAttributes);
            const newAvatar = 'https://example.com/new-avatar.png';

            user.update({ avatar: newAvatar });

            expect(user.avatar).toBe(newAvatar);
        });

        it('should update to null avatar when null is provided', () => {
            const user = User.create(mockUserAttributes);

            user.update({ avatar: null });

            expect(user.avatar).toBeNull();
        });

        it('should update audioPreferences when provided', () => {
            const user = User.create(mockUserAttributes);
            const newAudioPrefs: UserAudioPreferences = {
                entryAudio: 'new-sound.mp3',
                volume: 50,
                playOnEntry: false,
                favorites: ['fav1.mp3', 'fav2.mp3', 'fav3.mp3'],
            };

            user.update({ audioPreferences: newAudioPrefs });

            expect(user.audioPreferences).toEqual(newAudioPrefs);
        });

        it('should only update the provided properties', () => {
            const user = User.create(mockUserAttributes);
            const originalUsername = user.username;
            const originalAvatar = user.avatar;
            const newDisplayName = 'Updated Display Name';

            user.update({ displayName: newDisplayName });

            expect(user.username).toBe(originalUsername);
            expect(user.displayName).toBe(newDisplayName);
            expect(user.avatar).toBe(originalAvatar);
        });

        it('should not update any properties when an empty object is provided', () => {
            const user = User.create(mockUserAttributes);
            const originalState = {
                username: user.username,
                displayName: user.displayName,
                avatar: user.avatar,
                audioPreferences: { ...user.audioPreferences },
            };

            user.update({});

            expect(user.username).toBe(originalState.username);
            expect(user.displayName).toBe(originalState.displayName);
            expect(user.avatar).toBe(originalState.avatar);
            expect(user.audioPreferences).toEqual(originalState.audioPreferences);
        });
    });

    describe('getters', () => {
        let user: User;

        beforeEach(() => {
            user = User.create(mockUserAttributes);
        });

        it('should return the id', () => {
            expect(user.id).toBe(mockUserAttributes.id);
        });

        it('should return the username', () => {
            expect(user.username).toBe(mockUserAttributes.username);
        });

        it('should return the displayName', () => {
            expect(user.displayName).toBe(mockUserAttributes.displayName);
        });

        it('should return the avatar', () => {
            expect(user.avatar).toBe(mockUserAttributes.avatar);
        });

        it('should return the provider', () => {
            expect(user.provider).toBe(mockUserAttributes.provider);
        });

        it('should return the audioPreferences', () => {
            expect(user.audioPreferences).toEqual(mockUserAttributes.audioPreferences);
        });
    });

    describe('partial audio preferences', () => {
        it('should merge partial audio preferences with defaults', () => {
            const partialAudioPrefs = {
                volume: 60,
            };

            const userProps = {
                ...mockUserAttributes,
                audioPreferences: partialAudioPrefs as UserAudioPreferences,
            };

            const user = User.create(userProps);

            expect(user.audioPreferences).toEqual({
                entryAudio: null,
                volume: 60,
                playOnEntry: false,
                favorites: [],
            });
        });
    });
});
