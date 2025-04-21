import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthStrategy, ActiveAppStrategy } from './auth.types';
import { DiscordStrategy } from './discord.strategy';

@Injectable()
export class AuthStrategyFactory {
    private readonly _logger: Logger = new Logger(AuthStrategyFactory.name);
    private readonly _strategyMap: Map<string, ActiveAppStrategy> = new Map();
    private _activeStrategyName: AuthStrategy | undefined;

    constructor(
        private readonly _configService: ConfigService,
        private readonly _discordStrategy: DiscordStrategy,
    ) {
        this._strategyMap.set(AuthStrategy.DISCORD, this._discordStrategy);
        this._logger.log('AuthStrategyFactory initialized.');
    }

    /**
     * Provides the active authentication strategy name.
     *
     * This wrapper exposes the validated strategy name for external use.
     *
     * @returns The active strategy name.
     */
    public getActiveStrategyName(): AuthStrategy {
        return this._getActiveStrategyName();
    }

    /**
     * Returns the instance of the active authentication strategy.
     *
     * Retrieves the strategy corresponding to the validated configuration so that the
     * correct Passport strategy is used for authentication.
     *
     * @returns The active authentication strategy instance.
     */
    public getActiveStrategyInstance(): ActiveAppStrategy {
        const name: AuthStrategy = this._getActiveStrategyName();
        const strategy: ActiveAppStrategy | undefined = this._strategyMap.get(name);

        if (!strategy) {
            const errorMsg: string = `Strategy instance for '${name}' not found in map. Check constructor injection and map population.`;
            this._logger.error(errorMsg);
            throw new Error(errorMsg);
        }
        return strategy;
    }

    /**
     * Determines and caches the active authentication strategy name based on configuration.
     *
     * Reads the 'AUTH_STRATEGY' from the configuration, validates it against known strategies,
     * and falls back to a default if necessary.
     *
     * @returns The active authentication strategy name.
     */
    private _getActiveStrategyName(): AuthStrategy {
        if (this._activeStrategyName !== undefined) {
            return this._activeStrategyName;
        }

        const strategyName: string | undefined = this._configService
            .get<string>('authStrategy')
            ?.toLowerCase();

        if (strategyName === undefined) {
            this._logger.warn('AUTH_STRATEGY not defined in config, defaulting to discord.');

            this._activeStrategyName = AuthStrategy.DISCORD;
            return this._activeStrategyName;
        }

        if (!this._isValidAuthStrategy(strategyName)) {
            const errorMsg: string = `Configured AUTH_STRATEGY '${strategyName}' is not valid.`;
            this._logger.error(errorMsg);
            throw new Error(errorMsg);
        }

        this._logger.log(`Active authentication strategy set to: ${strategyName}`);

        this._activeStrategyName = strategyName;
        return this._activeStrategyName;
    }

    /**
     * Validates that the provided value matches a known authentication strategy.
     *
     * This check is essential to ensure that configuration errors are caught early,
     * preventing the use of an unsupported or misspelled strategy name.
     *
     * @param authStrategy - The value to validate.
     * @returns True if the value is a recognized strategy.
     */
    private _isValidAuthStrategy(authStrategy: unknown): authStrategy is AuthStrategy {
        return Object.values(AuthStrategy).some((strategyEnumValue) => strategyEnumValue === authStrategy);
    }
}
