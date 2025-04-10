import { DiscordStrategy } from './discord.strategy';

export enum NodeEnvironment {
    PROD = 'production',
    DEV = 'development',
}

export enum AuthStrategy {
    DISCORD = 'discord',
}

export type PassportStrategy = DiscordStrategy;
