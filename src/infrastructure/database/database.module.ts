import { Module, Provider } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PostgresModule } from './postgres/postgres.module';
import { PostgresRepositoryFactory } from './postgres/postgres.factory';
import { TRANSACTION_MANAGER, RepositoryTokens } from './database.constants';
import { PostgresTransactionManager } from './transaction/postgres-transaction.manager';
import { DatabaseProviders } from './types/factory.types';
import { PostgresConnection } from './postgres/postgres.connection';
import { UserRepository } from 'src/domain/ports/repositories';
import { AudioRepository } from 'src/domain/ports/repositories/audio-repository.interface';

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

const USER_REPOSITORY_PROVIDER: Provider = {
    provide: RepositoryTokens.USER,
    useFactory: (postgresRepoFactory: PostgresRepositoryFactory): UserRepository => {
        return postgresRepoFactory.getUserRepository();
    },
    inject: [PostgresRepositoryFactory],
};

const AUDIO_REPOSITORY_PROVIDER: Provider = {
    provide: RepositoryTokens.AUDIO,
    useFactory: (postgresRepoFactory: PostgresRepositoryFactory): AudioRepository => {
        return postgresRepoFactory.getAudioRepository();
    },
    inject: [PostgresRepositoryFactory],
};

@Module({
    imports: [ConfigModule, PostgresModule],
    providers: [
        PostgresRepositoryFactory,
        TRANSACTION_MANAGER_PROVIDER,
        USER_REPOSITORY_PROVIDER,
        AUDIO_REPOSITORY_PROVIDER,
    ],
    exports: [TRANSACTION_MANAGER, RepositoryTokens.USER, RepositoryTokens.AUDIO],
})
export class DatabaseModule {}
