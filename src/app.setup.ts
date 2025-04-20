import { INestApplication, Logger } from '@nestjs/common';
import * as session from 'express-session';
import * as passport from 'passport';
import { ConfigService } from '@nestjs/config';
import { initializeValidationPipe } from './config/validation.pipe';

export async function setupApp(app: INestApplication): Promise<void> {
    const configService = app.get(ConfigService);
    const logger = new Logger('AppSetup');

    const sessionSecret = configService.get<string>('session.secret');
    const uiUrl = configService.get<string>('UI_URL');

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

    initializeValidationPipe(app);

    app.enableCors({
        origin: uiUrl ?? true,
        credentials: true,
    });
}
