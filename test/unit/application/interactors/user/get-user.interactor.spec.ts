import { Test, TestingModule } from '@nestjs/testing';
import { GetUserInteractor } from 'src/application/interactors/user';
import { UserRepository } from 'src/domain/ports/repositories';
import { User } from 'src/domain/entities/user/user.entity';
import { UserAttributes } from 'src/domain/entities/user/user.types';
import { RepositoryTokens } from 'src/infrastructure/database/database.constants';

describe('GetUserInteractor', () => {
    let interactor: GetUserInteractor;
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
            findOneById: jest.fn(),
            create: jest.fn(),
            findOneByUsername: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                GetUserInteractor,
                {
                    provide: RepositoryTokens.USER,
                    useValue: mockUserRepository,
                },
            ],
        }).compile();

        interactor = module.get<GetUserInteractor>(GetUserInteractor);
        userRepository = module.get(RepositoryTokens.USER);
    });

    describe('execute', () => {
        it('should return user when found', async () => {
            userRepository.findOneById.mockResolvedValue(mockUser);
            const userId = 'test-id';

            const result = await interactor.execute(userId);

            expect(userRepository.findOneById).toHaveBeenCalledWith(userId);
            expect(result).toBeDefined();
            expect(result).toBeInstanceOf(User);
            expect(result).toEqual(mockUser);
        });

        it('should return undefined when user is not found', async () => {
            userRepository.findOneById.mockResolvedValue(undefined);
            const userId = 'non-existent-id';

            const result = await interactor.execute(userId);

            expect(userRepository.findOneById).toHaveBeenCalledWith(userId);
            expect(result).toBeUndefined();
        });
    });
});
