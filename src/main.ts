import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupApp } from './app.setup';
import { ConfigService } from '@nestjs/config';
import { Logger } from '@nestjs/common';

async function bootstrap(): Promise<void> {
    const app = await NestFactory.create(AppModule, {
        logger: ['debug', 'warn', 'error', 'fatal'],
    });
    const logger = new Logger('Bootstrap');

    await setupApp(app);

    const configService = app.get(ConfigService);
    const port = configService.get<number>('port') ?? 3000;

    await app.listen(port);
    logger.log(`🚀 Application is running on: http://localhost:${port}/api`);
}

bootstrap().catch((error) => {
    const errorLogger = new Logger('Bootstrap');
    errorLogger.error(`Fatal error during application bootstrap: ${error.message}`, error.stack);
    process.exit(1);
});
