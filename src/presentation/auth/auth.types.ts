import { User } from 'src/domain/entities/user/user.entity';
import { DiscordStrategy } from './discord.strategy';

export enum NodeEnvironment {
    PROD = 'production',
    DEV = 'development',
}

export enum AuthStrategy {
    DISCORD = 'discord',
}

export enum AuthGuardName {
    DISCORD = 'discord',
}

export type ActiveAppStrategy = DiscordStrategy;
export type Done = (err: Error | null, user: User | null) => void;
