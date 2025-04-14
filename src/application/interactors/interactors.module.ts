import { Module } from '@nestjs/common';
import { CreateUserInteractor, GetUserInteractor, UpdateUserInteractor } from './user';
import { DatabaseModule } from 'src/infrastructure/database/database.module';
import { RepositoryTokens } from 'src/infrastructure/database/database.constants';
import { DatabaseFactory } from 'src/infrastructure/database/database.factory';
import { UserRepository } from 'src/domain/ports/repositories';
import { Repository } from 'src/infrastructure/database/types/factory.types';

const userRepositoryProvider = {
    provide: RepositoryTokens.USER,
    useFactory: (databaseFactory: DatabaseFactory): UserRepository => {
        return databaseFactory.getRepository(Repository.USER);
    },
    inject: [DatabaseFactory],
};

@Module({
    imports: [DatabaseModule],
    providers: [GetUserInteractor, UpdateUserInteractor, CreateUserInteractor, userRepositoryProvider],
    exports: [GetUserInteractor, UpdateUserInteractor, CreateUserInteractor],
})
export class InteractorsModule {}
