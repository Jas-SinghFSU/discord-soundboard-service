import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseProviders } from '../types/factory.types';
import { PostgresConnection } from './postgres.connection';

@Module({
    imports: [ConfigModule],
    providers: [
        {
            provide: PostgresConnection,
            useFactory: async (configService: ConfigService): Promise<PostgresConnection> => {
                const pgConnection = new PostgresConnection(configService);
                const configuredDatabase =
                    configService.get<string>('database.type') ?? DatabaseProviders.POSTGRES;

                if (configuredDatabase === DatabaseProviders.POSTGRES) {
                    await pgConnection.initialize();
                }

                return pgConnection;
            },
            inject: [ConfigService],
        },
    ],
    exports: [PostgresConnection],
})
export class PostgresModule {}
