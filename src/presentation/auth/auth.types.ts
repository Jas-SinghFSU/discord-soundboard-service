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

export interface UserWithRoles {
    user: User;
    roles: string[];
}
export type Done<T = User> = (err: Error | null, user: T | null) => void;
export type DoneWithRoles = Done<UserWithRoles>;

/**
 * source: https://discord.com/developers/docs/topics/oauth2#shared-resources-oauth2-scopes
 */
export enum DiscordOAuthScope {
    IDENTIFY = 'identify',
    EMAIL = 'email',
    CONNECTIONS = 'connections',
    GUILDS = 'guilds',
    GUILDS_JOIN = 'guilds.join',
    GUILDS_MEMBERS_READ = 'guilds.members.read',
    GDM_JOIN = 'gdm.join',
    RPC = 'rpc',
    RPC_NOTIFICATIONS_READ = 'rpc.notifications.read',
    RPC_VOICE_READ = 'rpc.voice.read',
    RPC_VOICE_WRITE = 'rpc.voice.write',
    RPC_ACTIVITIES_WRITE = 'rpc.activities.write',
    BOT = 'bot',
    WEBHOOK_INCOMING = 'webhook.incoming',
    MESSAGES_READ = 'messages.read',
    APPLICATIONS_BUILDS_UPLOAD = 'applications.builds.upload',
    APPLICATIONS_BUILDS_READ = 'applications.builds.read',
    APPLICATIONS_COMMANDS = 'applications.commands',
    APPLICATIONS_COMMANDS_UPDATE = 'applications.commands.update',
    APPLICATIONS_ENTITLEMENTS = 'applications.entitlements',
    ACTIVITIES_READ = 'activities.read',
    ACTIVITIES_WRITE = 'activities.write',
    RELATIONSHIPS_READ = 'relationships.read',
}
