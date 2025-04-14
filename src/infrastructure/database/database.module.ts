import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseFactory } from './database.factory';
import { PostgresModule } from './postgres/postgres.module';
import { PostgresRepositoryFactory } from './postgres/postgres.factory';

@Module({
    imports: [ConfigModule, PostgresModule],
    providers: [PostgresRepositoryFactory, DatabaseFactory],
    exports: [DatabaseFactory],
})
export class DatabaseModule {}
