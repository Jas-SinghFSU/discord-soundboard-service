import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UserRoles } from 'src/domain/ports/providers/roles/roles-provider.types';
import { UserRolesProvider } from 'src/domain/ports/providers/roles/user-roles.provider';

@Injectable()
export class DiscordRolesProvider implements UserRolesProvider {
    private readonly _logger: Logger = new Logger(DiscordRolesProvider.name);
    private readonly _botToken: string;
    private readonly _serverId: string;

    constructor(private readonly _configService: ConfigService) {
        const botToken = this._configService.get<string>('discord.botToken');
        const serverId = this._configService.get<string>('discord.serverId');

        if (
            this._configService.get<string>('discord.clientID') === undefined ||
            this._configService.get<string>('discord.clientSecret') === undefined ||
            botToken === undefined ||
            serverId === undefined
        ) {
            this._logger.error('Discord clientID, clientSecret, botToken and/or serverId not configured!');
            throw new Error('Discord OAuth credentials missing.');
        }

        this._botToken = botToken;
        this._serverId = serverId;
    }

    public async getUserRoles(userId: string): Promise<UserRoles> {
        try {
            this._logger.debug('[getUserRoles] Fetching user roles');
            const url = `https://discord.com/api/v10/guilds/${this._serverId}/members/${userId}`;

            const headers = {
                Authorization: `Bot ${this._botToken}`,
                'Content-Type': 'application/json',
            };

            const userResponse = await fetch(url, { headers });
            const responseData = await userResponse.json();

            if (!userResponse.ok) {
                this._logger.error(
                    `Failed to fetch member data: ${userResponse.status} ${userResponse.statusText}`,
                );
                return {
                    expireAt: new Date(Date.now() + 50000),
                    roles: [],
                };
            }

            const roleIds = responseData.roles ?? [];

            return roleIds;
        } catch (error) {
            this._logger.error(
                `Error fetching roles: ${error instanceof Error ? error.message : String(error)}`,
            );
            throw new Error(`Failed to fetch roles for user: ${userId}`);
        }
    }
}
