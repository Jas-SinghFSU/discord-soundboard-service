import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserInteractor } from 'src/application/interactors/user/create-user.interactor';
import { UserRepository } from 'src/domain/ports/repositories';
import { User } from 'src/domain/entities/user/user.entity';
import { UserAttributes } from 'src/domain/entities/user/user.types';
import { RepositoryTokens } from 'src/infrastructure/database/database.constants';

describe('CreateUserInteractor', () => {
    let interactor: CreateUserInteractor;
    let userRepository: jest.Mocked<UserRepository>;

    const mockUserAttributes: UserAttributes = {
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

    const mockUser = User.create(mockUserAttributes);

    beforeEach(async () => {
        const mockUserRepository = {
            create: jest.fn(),
            findOneByUsername: jest.fn(),
            findOneById: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CreateUserInteractor,
                {
                    provide: RepositoryTokens.USER,
                    useValue: mockUserRepository,
                },
            ],
        }).compile();

        interactor = module.get<CreateUserInteractor>(CreateUserInteractor);
        userRepository = module.get(RepositoryTokens.USER);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('execute', () => {
        it('should successfully create a new user when username is unique', async () => {
            userRepository.findOneByUsername.mockResolvedValue(undefined);
            userRepository.create.mockResolvedValue(mockUser);

            const result = await interactor.execute(mockUserAttributes);

            expect(userRepository.findOneByUsername).toHaveBeenCalledWith(mockUserAttributes.username);
            expect(userRepository.create).toHaveBeenCalled();
            expect(result).toBeInstanceOf(User);
            expect(result.id).toBe(mockUserAttributes.id);
            expect(result.username).toBe(mockUserAttributes.username);
            expect(result.displayName).toBe(mockUserAttributes.displayName);
            expect(result.avatar).toBe(mockUserAttributes.avatar);
            expect(result.provider).toBe(mockUserAttributes.provider);
            expect(result.audioPreferences).toEqual(mockUserAttributes.audioPreferences);
        });

        it('should throw an error when username already exists', async () => {
            const existingUser = User.create(mockUserAttributes);
            userRepository.findOneByUsername.mockResolvedValue(existingUser);

            await expect(interactor.execute(mockUserAttributes)).rejects.toThrow(
                `Failed to create user. A user with the username '${mockUserAttributes.username}' already exists.`,
            );
            expect(userRepository.findOneByUsername).toHaveBeenCalledWith(mockUserAttributes.username);
            expect(userRepository.create).not.toHaveBeenCalled();
        });

        it('should call repository methods with correct parameters', async () => {
            userRepository.findOneByUsername.mockResolvedValue(undefined);
            userRepository.create.mockResolvedValue(mockUser);

            await interactor.execute(mockUserAttributes);

            expect(userRepository.findOneByUsername).toHaveBeenCalledWith(mockUserAttributes.username);
            expect(userRepository.create).toHaveBeenCalledWith(expect.any(User));

            const createCallArg = userRepository.create.mock.calls[0][0];
            expect(createCallArg).toEqual(mockUser);
        });
    });
});
