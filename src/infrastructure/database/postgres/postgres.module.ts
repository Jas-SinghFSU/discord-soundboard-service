import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseHosts } from '../types/factory.types';
import { PostgresConnection } from './postgres.connection';
import { ConfigKeys } from 'src/config/config.types';

@Module({
    imports: [ConfigModule],
    providers: [
        {
            provide: PostgresConnection,
            useFactory: async (configService: ConfigService): Promise<PostgresConnection> => {
                const pgConnection = new PostgresConnection(configService);
                const configuredDatabase =
                    configService.get<string>(ConfigKeys.DATABASE) ?? DatabaseHosts.POSTGRES;

                if (configuredDatabase === DatabaseHosts.POSTGRES) {
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
