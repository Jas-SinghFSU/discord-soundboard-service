import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, Profile } from 'passport-discord';
import { AuthService } from '../../application/services/auth.service';
import { CreateUserProps } from 'src/domain/entities/user/user.types';
import { UrlConfigService } from 'src/application/services/url.service';
import { AuthStrategy, DiscordOAuthScope, Done } from './auth.types';

/**
 * Implements Discord OAuth 2.0 authentication as a Passport strategy.
 *
 * This strategy is registered under the name 'discord' and is not invoked directly.
 * Instead, NestJS’s Passport integration automatically consumes it via AuthGuard('discord')
 * during the authentication process.
 *
 * The strategy ensures that critical Discord OAuth credentials are provided and uses the
 * callback mechanism to integrate Discord-provided user profiles with your application's user management.
 */
@Injectable()
export class DiscordStrategy extends PassportStrategy(Strategy, AuthStrategy.DISCORD) {
    private readonly _logger: Logger = new Logger(DiscordStrategy.name);

    constructor(
        private readonly _authService: AuthService,
        _configService: ConfigService,
        _urlService: UrlConfigService,
    ) {
        super({
            clientID: _configService.get<string>('discord.clientID') ?? '',
            clientSecret: _configService.get<string>('discord.clientSecret') ?? '',
            callbackURL: `${_urlService.apiUrl}/auth/discord/callback`,
            scope: [DiscordOAuthScope.IDENTIFY],
            passReqToCallback: false,
        });
    }

    /**
     * Processes the OAuth callback by transforming the Discord profile into an application user.
     *
     * Invoked automatically during the authentication process by Passport via the AuthGuard.
     * It delegates to AuthService to validate or create a user from the provided Discord profile.
     * Any errors during this process are caught and forwarded as an UnauthorizedException.
     *
     * @param _accessToken   The token provided by Discord to access user data.
     * @param _refreshToken  The token used to obtain a fresh access token if needed.
     * @param profile        The Discord profile data received post-authentication.
     * @param done           Callback to complete the Passport flow, passing either an error or the validated user.
     */
    public async validate(
        _accessToken: string,
        _refreshToken: string,
        profile: Profile,
        done: Done,
    ): Promise<void> {
        this._logger.debug(`Validating Discord profile: ${profile.username}#${profile.discriminator}`);
        this._logger.debug(`Received profile: ${JSON.stringify(profile)}`);

        try {
            const userProps: CreateUserProps = {
                id: profile.id,
                provider: profile.provider,
                username: profile.username,
                avatar: profile.avatar,
                displayName: profile.global_name ?? profile.username,
            };

            this._logger.debug(`Constructed userProps: ${JSON.stringify(userProps)}`);

            const user = await this._authService.validateOrCreateUser(userProps);

            return done(null, user);
        } catch (error: unknown) {
            this._logger.error(
                `Exception during validation for ${profile.id}: ${error instanceof Error ? error.message : String(error)}`,
            );
            return done(new UnauthorizedException('An unknown error occurred while validating user.'), null);
        }
    }
}
