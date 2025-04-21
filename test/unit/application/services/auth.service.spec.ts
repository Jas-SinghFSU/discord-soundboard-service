import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';
import { CreateUserProps } from 'src/domain/entities/user/user.types';
import { User } from 'src/domain/entities/user/user.entity';
import { AuthService } from 'src/application/services/auth.service';
import { UpdateUserInteractorProps } from 'src/application/interactors/user/user-interactor.types';
import {
    CreateUserInteractor,
    GetUserInteractor,
    UpdateUserInteractor,
} from 'src/application/interactors/user';

type MockInteractor<T, R> = {
    execute: jest.Mock<Promise<R>, [T]>;
};

const createMockUser = (props: CreateUserProps): User => {
    return {
        id: props.id,
        provider: props.provider,
        username: props.username,
        displayName: props.displayName,
        avatar: props.avatar,
        audioPreferences: props.audioPreferences ?? {
            entryAudio: null,
            volume: 100,
            playOnEntry: false,
            favorites: [],
        },
        getProps: () => props,
    } as unknown as User;
};

describe('AuthService', () => {
    let service: AuthService;
    let createUserInteractor: MockInteractor<CreateUserProps, User>;
    let updateUserInteractor: MockInteractor<UpdateUserInteractorProps, User>;
    let getUserInteractor: MockInteractor<string, User | null | undefined>;

    let mockProfile: CreateUserProps;
    let mockExistingUser: User;
    let mockExistingUserProps: CreateUserProps;
    let mockUpdatedUser: User;
    let mockNewUser: User;

    beforeEach(async () => {
        createUserInteractor = { execute: jest.fn() };
        updateUserInteractor = { execute: jest.fn() };
        getUserInteractor = { execute: jest.fn() };

        mockProfile = {
            id: 'discord-12345',
            provider: 'discord',
            username: 'TestUser',
            displayName: 'Test User Display',
            avatar: 'avatar_url',
            audioPreferences: { entryAudio: null, volume: 100, playOnEntry: false, favorites: [] },
        };

        mockExistingUserProps = {
            id: 'discord-12345',
            provider: 'discord',
            username: 'ExistingUser',
            displayName: 'Existing User Display',
            avatar: 'old_avatar_url',
            audioPreferences: { entryAudio: 'old_entry', volume: 80, playOnEntry: true, favorites: ['fav1'] },
        };
        mockExistingUser = createMockUser(mockExistingUserProps);

        mockUpdatedUser = createMockUser({ ...mockProfile });
        mockNewUser = createMockUser({ ...mockProfile });

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: CreateUserInteractor, useValue: createUserInteractor },
                { provide: UpdateUserInteractor, useValue: updateUserInteractor },
                { provide: GetUserInteractor, useValue: getUserInteractor },
            ],
        })
            .setLogger({
                log: jest.fn(),
                error: jest.fn(),
                warn: jest.fn(),
                debug: jest.fn(),
                verbose: jest.fn(),
            })
            .compile();

        service = module.get<AuthService>(AuthService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('validateOrCreateUser', () => {
        it('should return existing user if found and no updates are needed', async () => {
            const profileMatchingExisting = { ...mockExistingUserProps };
            getUserInteractor.execute.mockResolvedValue(mockExistingUser);

            const result = await service.validateOrCreateUser(profileMatchingExisting);

            expect(result).toBe(mockExistingUser);
            expect(getUserInteractor.execute).toHaveBeenCalledWith(profileMatchingExisting.id);
            expect(updateUserInteractor.execute).not.toHaveBeenCalled();
            expect(createUserInteractor.execute).not.toHaveBeenCalled();
        });

        it('should update and return user if found and profile data differs', async () => {
            getUserInteractor.execute.mockResolvedValue(mockExistingUser);
            updateUserInteractor.execute.mockResolvedValue(mockUpdatedUser);

            const result = await service.validateOrCreateUser(mockProfile);

            expect(result).toBe(mockUpdatedUser);
            expect(getUserInteractor.execute).toHaveBeenCalledWith(mockProfile.id);
            expect(updateUserInteractor.execute).toHaveBeenCalledWith({
                id: mockExistingUser.id,
                userData: {
                    username: mockProfile.username,
                    displayName: mockProfile.displayName,
                    avatar: mockProfile.avatar,
                },
            });
            expect(createUserInteractor.execute).not.toHaveBeenCalled();
        });

        it('should only include changed fields in the update payload', async () => {
            const profileWithOnlyUsernameChange: CreateUserProps = {
                ...mockExistingUserProps,
                username: 'NewUsername',
            };
            const userAfterUpdate = createMockUser({
                ...mockExistingUserProps,
                username: 'NewUsername',
            });

            getUserInteractor.execute.mockResolvedValue(mockExistingUser);
            updateUserInteractor.execute.mockResolvedValue(userAfterUpdate);

            const result = await service.validateOrCreateUser(profileWithOnlyUsernameChange);

            expect(result).toBe(userAfterUpdate);
            expect(getUserInteractor.execute).toHaveBeenCalledWith(profileWithOnlyUsernameChange.id);
            expect(updateUserInteractor.execute).toHaveBeenCalledWith({
                id: mockExistingUser.id,
                userData: {
                    username: 'NewUsername',
                },
            });
            expect(createUserInteractor.execute).not.toHaveBeenCalled();
        });

        it('should create and return a new user if not found', async () => {
            getUserInteractor.execute.mockResolvedValue(undefined);
            createUserInteractor.execute.mockResolvedValue(mockNewUser);

            const result = await service.validateOrCreateUser(mockProfile);

            expect(result).toBe(mockNewUser);
            expect(getUserInteractor.execute).toHaveBeenCalledWith(mockProfile.id);
            expect(updateUserInteractor.execute).not.toHaveBeenCalled();
            expect(createUserInteractor.execute).toHaveBeenCalledWith(mockProfile);
        });

        it('should throw InternalServerErrorException if getUserInteractor fails', async () => {
            const error = new Error('GetUser failed');
            getUserInteractor.execute.mockRejectedValue(error);

            await expect(service.validateOrCreateUser(mockProfile)).rejects.toThrow(
                InternalServerErrorException,
            );
            expect(getUserInteractor.execute).toHaveBeenCalledWith(mockProfile.id);
            expect(updateUserInteractor.execute).not.toHaveBeenCalled();
            expect(createUserInteractor.execute).not.toHaveBeenCalled();
        });

        it('should throw InternalServerErrorException if updateUserInteractor fails', async () => {
            const error = new Error('UpdateUser failed');
            getUserInteractor.execute.mockResolvedValue(mockExistingUser);
            updateUserInteractor.execute.mockRejectedValue(error);

            await expect(service.validateOrCreateUser(mockProfile)).rejects.toThrow(
                InternalServerErrorException,
            );
            expect(getUserInteractor.execute).toHaveBeenCalledWith(mockProfile.id);
            expect(updateUserInteractor.execute).toHaveBeenCalledWith({
                id: mockExistingUser.id,
                userData: {
                    username: mockProfile.username,
                    displayName: mockProfile.displayName,
                    avatar: mockProfile.avatar,
                },
            });
            expect(createUserInteractor.execute).not.toHaveBeenCalled();
        });

        it('should throw InternalServerErrorException if createUserInteractor fails', async () => {
            const error = new Error('CreateUser failed');
            getUserInteractor.execute.mockResolvedValue(undefined);
            createUserInteractor.execute.mockRejectedValue(error);

            await expect(service.validateOrCreateUser(mockProfile)).rejects.toThrow(
                InternalServerErrorException,
            );
            expect(getUserInteractor.execute).toHaveBeenCalledWith(mockProfile.id);
            expect(updateUserInteractor.execute).not.toHaveBeenCalled();
            expect(createUserInteractor.execute).toHaveBeenCalledWith(mockProfile);
        });

        it('should log non-Error exceptions correctly', async () => {
            const weirdError = 'something bad happened';

            getUserInteractor.execute.mockRejectedValue(weirdError as never);

            await expect(service.validateOrCreateUser(mockProfile)).rejects.toThrow(
                InternalServerErrorException,
            );

            expect(getUserInteractor.execute).toHaveBeenCalledWith(mockProfile.id);
        });
    });
});
