import { INestApplication, ValidationPipe } from '@nestjs/common';

/**
 * Initializes global validation pipe for the NestJS application
 *
 * Configures input validation with the following settings:
 * - Whitelist: Strips properties that don't have decorators
 * - ForbidNonWhitelisted: Throws error if non-whitelisted properties are present
 * - Transform: Automatically transforms payloads to their decorated types
 *
 * @param app The NestJS application instance
 */
export const initializeValidationPipe = (app: INestApplication): void => {
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );
};
