import { Module, Type } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthGuard, IAuthGuard, PassportModule } from '@nestjs/passport';
import { DiscordStrategy } from './discord.strategy';
import { AuthStrategyFactory } from './auth-strategy.factory';
import { AUTH_PROVIDER_TOKEN } from './auth.constants';

@Module({
    imports: [PassportModule, ConfigModule],
    providers: [
        AuthService,
        DiscordStrategy,
        AuthStrategyFactory,
        {
            provide: AUTH_PROVIDER_TOKEN,
            useFactory: (authStrategyFactory: AuthStrategyFactory): Type<IAuthGuard> => {
                const activeStrategyName = authStrategyFactory.getActiveStrategyName();
                const GuardClass = AuthGuard(activeStrategyName);

                return GuardClass;
            },
            inject: [AuthStrategyFactory],
        },
    ],
    controllers: [],
    exports: [AuthService, AuthStrategyFactory, AUTH_PROVIDER_TOKEN],
})
export class AuthModule {}
