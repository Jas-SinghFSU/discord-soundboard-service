import { Module, Provider } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DatabaseFactory } from './database.factory';
import { PostgresModule } from './postgres/postgres.module';
import { PostgresRepositoryFactory } from './postgres/postgres.factory';
import { TRANSACTION_MANAGER } from './database.constants';
import { PostgresTransactionManager } from './transaction/postgres-transaction.manager';
import { DatabaseProviders } from './types/factory.types';
import { PostgresConnection } from './postgres/postgres.connection';

const TRANSACTION_MANAGER_PROVIDER: Provider = {
    provide: TRANSACTION_MANAGER,
    useFactory: (configService: ConfigService, postgresConnection: PostgresConnection) => {
        const dbType = configService.get<string>('database.type');

        switch (dbType) {
            case DatabaseProviders.POSTGRES:
                return new PostgresTransactionManager(postgresConnection);
            default:
                throw new Error(`Unsupported database type "${dbType}" – no TransactionManager registered.`);
        }
    },
    inject: [ConfigService, PostgresConnection],
};

@Module({
    imports: [ConfigModule, PostgresModule],
    providers: [PostgresRepositoryFactory, DatabaseFactory, TRANSACTION_MANAGER_PROVIDER],
    exports: [DatabaseFactory, TRANSACTION_MANAGER],
})
export class DatabaseModule {}
