import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as session from 'express-session';
import * as passport from 'passport';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);
    const logger: Logger = new Logger('Bootstrap');

    const sessionSecret = configService.get<string>('SESSION_SECRET');
    const port = configService.get<number>('PORT') ?? 3000;
    const uiUrl = configService.get<string>('UI_URL');
    const apiUrl = configService.get<string>('API_URL') ?? `http://localhost:${port}/api`;

    const maxSessionAgeInDays = (days: number): number => 1000 * 60 * 60 * 24 * days;

    if (sessionSecret === undefined) {
        logger.error('SESSION_SECRET environment variable is not set. Authentication will fail.');
        throw new Error('SESSION_SECRET environment variable is not set.');
    }
    if (uiUrl === undefined) {
        logger.warn('UI_URL environment variable is not set. CORS or redirects might fail.');
    }

    app.setGlobalPrefix('api');

    app.use(
        session({
            secret: sessionSecret,
            resave: false,
            saveUninitialized: false,
            cookie: {
                maxAge: maxSessionAgeInDays(7),
                httpOnly: true,
            },
        }),
    );

    app.use(passport.initialize());
    app.use(passport.session());

    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.enableCors({
        origin: uiUrl ?? true,
        credentials: true,
    });

    await app.listen(port);
    logger.log(`🚀 Application is running on: http://localhost:${port}/api`);
    logger.log(` B UI URL configured as: ${uiUrl ?? 'Not Set'}`);
    logger.log(`🔑 Configured Discord Callback: ${apiUrl}/auth/discord/callback`);
}

bootstrap().catch((error) => {
    const errorLogger = new Logger('Bootstrap');
    errorLogger.error(`Fatal error during application bootstrap: ${error.message}`, error.stack);
    process.exit(1);
});
