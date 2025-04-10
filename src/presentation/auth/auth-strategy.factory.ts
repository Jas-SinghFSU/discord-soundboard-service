import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DiscordStrategy } from './discord.strategy';
import { AuthStrategy, PassportStrategy } from './types';

@Injectable()
export class AuthStrategyFactory {
    private readonly _strategyMap: Map<string, PassportStrategy> = new Map();
    private _activeStrategyName: AuthStrategy;

    constructor(
        private readonly _configService: ConfigService,
        private readonly _discordStrategy: DiscordStrategy,
    ) {
        this._strategyMap.set(AuthStrategy.DISCORD, this._discordStrategy);
    }

    /**
     * Gets the name of the currently configured authentication strategy.
     *
     * @returns The active strategy name (ex: 'discord') or null if none is configured or valid.
     */
    public getActiveStrategyName(): AuthStrategy {
        if (this._activeStrategyName !== null) {
            return this._activeStrategyName;
        }

        const strategyName = this._configService.get<string>('AUTH_STRATEGY')?.toLowerCase();

        if (strategyName === undefined) {
            this._activeStrategyName = AuthStrategy.DISCORD;

            return this._activeStrategyName;
        }

        if (!this._isValidAuthStrategy(strategyName)) {
            throw new Error(`Configured AUTH_STRATEGY '${strategyName}' is not a valid strategy.`);
        }

        this._activeStrategyName = strategyName;

        return strategyName;
    }

    /**
     * Gets the instance of the currently configured authentication strategy.
     *
     * @returns The active strategy instance or null.
     */
    public getActiveStrategyInstance(): PassportStrategy {
        const name = this.getActiveStrategyName();
        const strategy = this._strategyMap.get(name);

        if (!strategy) {
            throw new Error(`Strategy ${name} not found in strategy map`);
        }

        return strategy;
    }

    private _isValidAuthStrategy(authStrategy: unknown): authStrategy is AuthStrategy {
        return Object.values(AuthStrategy).some((strategy) => strategy === authStrategy);
    }
}
