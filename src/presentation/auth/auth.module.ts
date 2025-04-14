import { Module, Type, Provider } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthGuard as NestAuthGuard, IAuthGuard, PassportModule } from '@nestjs/passport';
import { AuthStrategyFactory } from './auth-strategy.factory';
import { AUTH_PROVIDER_TOKEN } from './auth.constants';
import { AuthService } from '../../application/services/auth.service';
import { UrlConfigService } from 'src/config/services/url.service';
import { SessionSerializer } from './session.serializer';
import { DiscordStrategy } from './discord.strategy';

/**
 * Provides a dynamic authentication guard.
 *
 * By querying the AuthStrategyFactory for the active strategy name and returning the corresponding NestJS AuthGuard,
 * this provider makes it simple to switch authentication strategies via configuration without modifying dependent code.
 */
const AuthGuardProvider: Provider = {
    provide: AUTH_PROVIDER_TOKEN,
    useFactory: (authStrategyFactory: AuthStrategyFactory): Type<IAuthGuard> => {
        const activeStrategyName: string = authStrategyFactory['_getActiveStrategyName']();
        const GuardClass: Type<IAuthGuard> = NestAuthGuard(activeStrategyName);
        return GuardClass;
    },
    inject: [AuthStrategyFactory],
};

@Module({
    imports: [PassportModule.register({ session: true }), ConfigModule],
    providers: [
        AuthService,
        UrlConfigService,
        SessionSerializer,
        DiscordStrategy,
        AuthStrategyFactory,
        AuthGuardProvider,
    ],
    exports: [AuthService, AuthStrategyFactory, AUTH_PROVIDER_TOKEN],
})
export class AuthModule {}
