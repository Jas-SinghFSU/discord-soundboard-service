import { Module, Type, Provider } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthGuard as NestAuthGuard, IAuthGuard, PassportModule } from '@nestjs/passport';
import { AuthStrategyFactory } from './auth-strategy.factory';
import { AUTH_PROVIDER_TOKEN } from './auth.constants';
import { UrlConfigService } from 'src/application/services/url.service';
import { SessionSerializer } from './session.serializer';
import { DiscordStrategy } from './discord.strategy';
import { ServicesModule } from 'src/application/services/services.module';
import { InteractorsModule } from 'src/application/interactors/interactors.module';

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
    imports: [
        PassportModule.register({ session: true, property: 'user' }),
        ConfigModule,
        ServicesModule,
        InteractorsModule,
    ],
    providers: [UrlConfigService, SessionSerializer, DiscordStrategy, AuthStrategyFactory, AuthGuardProvider],
    exports: [AuthStrategyFactory, AUTH_PROVIDER_TOKEN],
})
export class AuthModule {}
