import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { SessionSerializer } from '../../../../src/presentation/auth/session.serializer';
import { GetUserInteractor } from '../../../../src/application/interactors/user';
import { User } from '../../../../src/domain/entities/user/user.entity';

describe('SessionSerializer', () => {
    let serializer: SessionSerializer;
    let getUserInteractor: GetUserInteractor;

    const mockUser = {
        id: 'test-user-id',
        username: 'testuser',
        displayName: 'Test User',
        avatar: 'avatar-url',
        provider: 'discord',
        audioPreferences: {
            entryAudio: null,
            volume: 100,
            playOnEntry: false,
            favorites: ['some'],
        },
    } as User;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                SessionSerializer,
                {
                    provide: GetUserInteractor,
                    useValue: {
                        execute: jest.fn(),
                    },
                },
            ],
        }).compile();

        serializer = module.get<SessionSerializer>(SessionSerializer);
        getUserInteractor = module.get<GetUserInteractor>(GetUserInteractor);

        jest.spyOn(Logger.prototype, 'debug').mockImplementation(() => undefined);
        jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
        jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    });

    describe('serializeUser', () => {
        it('should serialize user to just the user ID', () => {
            const doneMock = jest.fn();

            serializer.serializeUser(mockUser, doneMock);

            expect(doneMock).toHaveBeenCalledWith(null, 'test-user-id');
            expect(Logger.prototype.debug).toHaveBeenCalledWith(expect.stringContaining('test-user-id'));
        });
    });

    describe('deserializeUser', () => {
        it('should deserialize user ID to full user object', async () => {
            const doneMock = jest.fn();
            jest.spyOn(getUserInteractor, 'execute').mockResolvedValueOnce(mockUser);

            await serializer.deserializeUser('test-user-id', doneMock);

            expect(getUserInteractor.execute).toHaveBeenCalledWith('test-user-id');
            expect(doneMock).toHaveBeenCalledWith(null, mockUser);
            expect(Logger.prototype.debug).toHaveBeenCalledWith(expect.stringContaining('test-user-id'));
        });

        it('should handle user not found during deserialization', async () => {
            const doneMock = jest.fn();
            jest.spyOn(getUserInteractor, 'execute').mockResolvedValueOnce(undefined);

            await serializer.deserializeUser('nonexistent-id', doneMock);

            expect(getUserInteractor.execute).toHaveBeenCalledWith('nonexistent-id');
            expect(doneMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: expect.stringContaining('Failed to deserialize user'),
                }),
                null,
            );
            expect(Logger.prototype.warn).toHaveBeenCalled();
        });

        it('should handle errors during deserialization', async () => {
            const doneMock = jest.fn();
            const testError = new Error('Test deserialization error');

            jest.spyOn(getUserInteractor, 'execute').mockRejectedValueOnce(testError);

            await serializer.deserializeUser('test-user-id', doneMock);

            expect(getUserInteractor.execute).toHaveBeenCalledWith('test-user-id');
            expect(doneMock).toHaveBeenCalledWith(testError, null);
            expect(Logger.prototype.error).toHaveBeenCalled();
        });

        it('should convert non-Error objects to Error during error handling', async () => {
            const doneMock = jest.fn();
            const nonErrorObject = 'String error';

            jest.spyOn(getUserInteractor, 'execute').mockRejectedValueOnce(nonErrorObject);

            await serializer.deserializeUser('test-user-id', doneMock);

            expect(getUserInteractor.execute).toHaveBeenCalledWith('test-user-id');
            expect(doneMock).toHaveBeenCalledWith(
                expect.objectContaining({
                    message: 'Deserialization error',
                }),
                null,
            );
            expect(Logger.prototype.error).toHaveBeenCalled();
        });
    });
});
