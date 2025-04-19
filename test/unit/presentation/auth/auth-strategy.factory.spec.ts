import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';
import { AuthStrategyFactory } from 'src/presentation/auth/auth-strategy.factory';
import { DiscordStrategy } from 'src/presentation/auth/discord.strategy';
import { AuthStrategy } from 'src/presentation/auth/auth.types';

describe('AuthStrategyFactory', () => {
    let factory: AuthStrategyFactory;
    let configService: ConfigService;
    let discordStrategy: DiscordStrategy;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthStrategyFactory,
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn(),
                    },
                },
                {
                    provide: DiscordStrategy,
                    useValue: {},
                },
            ],
        }).compile();

        factory = module.get<AuthStrategyFactory>(AuthStrategyFactory);
        configService = module.get<ConfigService>(ConfigService);
        discordStrategy = module.get<DiscordStrategy>(DiscordStrategy);

        jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
        jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
        jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    });

    describe('getActiveStrategyName', () => {
        it('should return cached strategy name if available', () => {
            (factory as unknown as { _activeStrategyName: AuthStrategy })._activeStrategyName =
                AuthStrategy.DISCORD;

            const result = factory.getActiveStrategyName();

            expect(result).toBe(AuthStrategy.DISCORD);
            expect(configService.get).not.toHaveBeenCalled();
        });

        it('should default to DISCORD when no strategy is configured', () => {
            jest.spyOn(configService, 'get').mockReturnValue(undefined);

            const result = factory.getActiveStrategyName();

            expect(result).toBe(AuthStrategy.DISCORD);
            expect(Logger.prototype.warn).toHaveBeenCalled();
            expect((factory as unknown as { _activeStrategyName: AuthStrategy })._activeStrategyName).toBe(
                AuthStrategy.DISCORD,
            );
        });

        it('should throw error when configured strategy is invalid', () => {
            jest.spyOn(configService, 'get').mockReturnValue('invalid-strategy');

            expect(() => factory.getActiveStrategyName()).toThrow(
                "Configured AUTH_STRATEGY 'invalid-strategy' is not valid.",
            );
            expect(Logger.prototype.error).toHaveBeenCalled();
        });

        it('should return and cache valid configured strategy', () => {
            jest.spyOn(configService, 'get').mockReturnValue('discord');

            const result = factory.getActiveStrategyName();

            expect(result).toBe(AuthStrategy.DISCORD);
            expect(Logger.prototype.log).toHaveBeenCalledWith(
                'Active authentication strategy set to: discord',
            );
            expect((factory as unknown as { _activeStrategyName: AuthStrategy })._activeStrategyName).toBe(
                AuthStrategy.DISCORD,
            );
        });
    });

    describe('getActiveStrategyInstance', () => {
        it('should return the strategy instance for the active strategy', () => {
            (factory as unknown as { _activeStrategyName: AuthStrategy })._activeStrategyName =
                AuthStrategy.DISCORD;

            const result = factory.getActiveStrategyInstance();

            expect(result).toBe(discordStrategy);
        });

        it('should throw error if strategy instance is not found in map', () => {
            (factory as unknown as { _activeStrategyName: AuthStrategy })._activeStrategyName =
                AuthStrategy.DISCORD;

            (factory as unknown as { _strategyMap: Map<string, unknown> })._strategyMap = new Map();

            expect(() => factory.getActiveStrategyInstance()).toThrow(
                "Strategy instance for 'discord' not found in map. Check constructor injection and map population.",
            );
            expect(Logger.prototype.error).toHaveBeenCalled();
        });
    });

    describe('_isValidAuthStrategy', () => {
        it('should return true for valid auth strategy', () => {
            const isValidMethod = (
                factory as unknown as {
                    _isValidAuthStrategy(authStrategy: unknown): boolean;
                }
            )._isValidAuthStrategy;

            expect(isValidMethod.call(factory, AuthStrategy.DISCORD)).toBe(true);
        });

        it('should return false for invalid auth strategy', () => {
            const isValidMethod = (
                factory as unknown as {
                    _isValidAuthStrategy(authStrategy: unknown): boolean;
                }
            )._isValidAuthStrategy;

            expect(isValidMethod.call(factory, 'invalid-strategy')).toBe(false);
            expect(isValidMethod.call(factory, null)).toBe(false);
            expect(isValidMethod.call(factory, undefined)).toBe(false);
            expect(isValidMethod.call(factory, 123)).toBe(false);
        });
    });
});
