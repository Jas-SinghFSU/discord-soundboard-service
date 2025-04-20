import { Test, TestingModule } from '@nestjs/testing';
import { UpdateUserInteractor } from 'src/application/interactors/user';
import { UserRepository } from 'src/domain/ports/repositories';
import { User } from 'src/domain/entities/user/user.entity';
import { CreateUserProps } from 'src/domain/entities/user/user.types';
import { RepositoryTokens } from 'src/infrastructure/database/database.constants';
import { UpdateUserInteractorProps } from 'src/application/interactors/user/user-interactor.types';

describe('UpdateUserInteractor', () => {
    let interactor: UpdateUserInteractor;
    let userRepository: jest.Mocked<UserRepository>;

    const mockUserAttributes: CreateUserProps = {
        id: 'test-id',
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

    beforeEach(async () => {
        const mockUserRepository = {
            create: jest.fn(),
            findOneByUsername: jest.fn(),
            findOneById: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                UpdateUserInteractor,
                {
                    provide: RepositoryTokens.USER,
                    useValue: mockUserRepository,
                },
            ],
        }).compile();

        interactor = module.get<UpdateUserInteractor>(UpdateUserInteractor);
        userRepository = module.get(RepositoryTokens.USER);
    });

    describe('execute', () => {
        it('should successfully update a user when no conflicts exist', async () => {
            const updateData: UpdateUserInteractorProps = {
                id: 'test-id',
                userData: {
                    username: 'newusername',
                    displayName: 'New Display Name',
                },
            };

            const existingUser = User.create(mockUserAttributes);
            userRepository.findOneById.mockResolvedValue(existingUser);
            userRepository.findOneByUsername.mockResolvedValue(undefined);
            userRepository.create.mockImplementation((user) => Promise.resolve(user));

            const result = await interactor.execute(updateData);

            expect(userRepository.findOneById).toHaveBeenCalledWith(updateData.id);
            expect(userRepository.findOneByUsername).toHaveBeenCalledWith(updateData.userData.username);
            expect(userRepository.create).toHaveBeenCalled();
            expect(result.username).toBe(updateData.userData.username);
            expect(result.displayName).toBe(updateData.userData.displayName);
        });

        it('should throw error when user is not found', async () => {
            const updateData: UpdateUserInteractorProps = {
                id: 'non-existent-id',
                userData: {
                    username: 'newusername',
                },
            };

            userRepository.findOneById.mockResolvedValue(undefined);

            await expect(interactor.execute(updateData)).rejects.toThrow(
                `Failed to update user. User with ID '${updateData.id}' not found.`,
            );
            expect(userRepository.create).not.toHaveBeenCalled();
        });

        it('should throw error when username conflicts with existing user', async () => {
            const updateData: UpdateUserInteractorProps = {
                id: 'test-id',
                userData: {
                    username: 'existing-username',
                },
            };

            const existingUser = User.create(mockUserAttributes);
            const conflictingUser = User.create({
                ...mockUserAttributes,
                id: 'other-id',
                username: 'existing-username',
            });

            userRepository.findOneById.mockResolvedValue(existingUser);
            userRepository.findOneByUsername.mockResolvedValue(conflictingUser);

            await expect(interactor.execute(updateData)).rejects.toThrow(
                `Failed to update user. A user with the username '${updateData.userData.username}' already exists.`,
            );
            expect(userRepository.create).not.toHaveBeenCalled();
        });

        it('should maintain existing user properties when updating partial data', async () => {
            const updateData: UpdateUserInteractorProps = {
                id: 'test-id',
                userData: {
                    displayName: 'New Display Name',
                },
            };

            const existingUser = User.create(mockUserAttributes);
            userRepository.findOneById.mockResolvedValue(existingUser);
            userRepository.findOneByUsername.mockResolvedValue(undefined);
            userRepository.create.mockImplementation((user) => Promise.resolve(user));

            const result = await interactor.execute(updateData);

            expect(result.displayName).toBe(updateData.userData.displayName);
            expect(result.username).toBe(mockUserAttributes.username);
            expect(result.avatar).toBe(mockUserAttributes.avatar);
            expect(result.provider).toBe(mockUserAttributes.provider);
        });
    });
});
