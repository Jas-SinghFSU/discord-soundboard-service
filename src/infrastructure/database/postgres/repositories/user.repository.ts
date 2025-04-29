import { User } from 'src/domain/entities/user/user.entity';
import { UserRepository } from 'src/domain/ports/repositories';
import { Transaction as DomainTransaction } from 'src/domain/ports/transactions/transaction.interface';
import { PostgresTables } from '../postgres.types';
import { PostgresDb } from '../tables';
import { Inject } from '@nestjs/common';
import { PostgresMapperTokens } from '../../database.constants';
import { Kysely, Transaction as KyselyTransaction } from 'kysely';
import { PostgresTransaction } from '../postgres.types';
import { PostgresUserMapper } from '../../mappers';

export class PostgresUserRepository implements UserRepository {
    private readonly _table = PostgresTables.USERS;

    constructor(
        private readonly _db: Kysely<PostgresDb>,

        @Inject(PostgresMapperTokens.USER)
        private readonly _mapper: PostgresUserMapper,
    ) {}

    public async create(user: User, transaction?: DomainTransaction): Promise<User> {
        const executor = this._getExecutor(transaction);
        const postgresUserAttributes = this._mapper.toRecord(user);

        const insertedUser = await executor
            .insertInto(this._table)
            .values(postgresUserAttributes)
            .returningAll()
            .executeTakeFirst();

        if (insertedUser === undefined) {
            throw new Error('User insertion failed.');
        }

        return user;
    }

    public async findOneByUsername(
        username: string,
        transaction?: DomainTransaction,
    ): Promise<User | undefined> {
        const executor = this._getExecutor(transaction);

        const query = executor.selectFrom(this._table).where('username', '=', username).selectAll();

        const foundUser = await query.executeTakeFirst();

        if (foundUser === undefined) {
            return;
        }

        const userEntity = this._mapper.toEntity(foundUser);
        return userEntity;
    }

    public async findOneById(userId: string, transaction?: DomainTransaction): Promise<User | undefined> {
        const executor = this._getExecutor(transaction);

        const query = executor.selectFrom(this._table).where('id', '=', userId).selectAll();

        const foundUser = await query.executeTakeFirst();

        if (foundUser === undefined) {
            return;
        }

        const userEntity = this._mapper.toEntity(foundUser);
        return userEntity;
    }

    public async update(user: User, transaction?: DomainTransaction): Promise<User> {
        const executor = this._getExecutor(transaction);
        const postgresUserAttributes = this._mapper.toRecord(user);

        const updatedUser = await executor
            .updateTable(this._table)
            .set(postgresUserAttributes)
            .where('id', '=', user.id)
            .returningAll()
            .executeTakeFirst();

        if (updatedUser === undefined) {
            throw new Error('User update failed.');
        }

        return user;
    }

    private _getExecutor(
        transaction?: DomainTransaction,
    ): Kysely<PostgresDb> | KyselyTransaction<PostgresDb> {
        return transaction ? (transaction as PostgresTransaction).transaction : this._db;
    }
}
