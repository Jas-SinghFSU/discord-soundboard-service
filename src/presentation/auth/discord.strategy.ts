import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import Strategy, { Profile } from 'passport-discord';
import { NodeEnvironment } from './types';

@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy, 'discord') {
    constructor(
        private readonly _authService: AuthService,
        private readonly _configService: ConfigService,
    ) {
        super({
            clientID: _configService.get<string>('DISCORD_CLIENT_ID') ?? '',
            clientSecret: _configService.get<string>('DISCORD_CLIENT_SECRET') ?? '',
            callbackURL: DiscordStrategy._getCallbackUrl(_configService),
            scope: ['identify'],
        });
    }

    public async validate(_accessToken: string, _refreshToken: string, profile: Profile): User {
        const user = await this._authService.validateOrCreateUserFromDiscordProfile(profile);

        return user;
    }

    private static _getCallbackUrl(configService: ConfigService): string {
        const environment = configService.get<NodeEnvironment>('NODE_ENV');
        const productionUrl = configService.get<string>('PRODUCTION_URL');

        const returnUrls = {
            prod: `${productionUrl}/api/auth/discord/return`,
            dev: 'http://localhost:3000/api/auth/discord/return',
        };

        return environment === NodeEnvironment.PROD ? returnUrls.prod : returnUrls.dev;
    }
}
