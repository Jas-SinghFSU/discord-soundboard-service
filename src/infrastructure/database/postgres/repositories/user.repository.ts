import { Kysely } from 'kysely';
import { Pool } from 'pg';
import { User } from 'src/domain/entities/user/user.entity';
import { UserRepository } from 'src/domain/ports/repositories/user-repository.interface';
import { PostgresDb } from '../models/postgres.model';
import { createDb } from '../postgres.provider';
import { PostgresTables } from '../postgres.types';
import { Mapper } from '../../types/mapper.interface';
import { PostgresUser } from '../models';
import { Inject } from '@nestjs/common';
import { PostgresMapperTokens } from '../../database.constants';

export class PostgresUserRepository implements UserRepository {
    private readonly _db: Kysely<PostgresDb>;
    private readonly _table = PostgresTables.USERS;

    constructor(
        pool: Pool,
        @Inject(PostgresMapperTokens.USER)
        private readonly _mapper: Mapper<User, PostgresUser>,
    ) {
        this._db = createDb(pool);
    }

    public async create(user: User): Promise<User> {
        const postgresUserAttributes = this._mapper.toRecord(user);

        const insertedUser = await this._db
            .insertInto(this._table)
            .values(postgresUserAttributes)
            .returningAll()
            .executeTakeFirst();

        if (insertedUser === undefined) {
            throw new Error('User insertion failed.');
        }

        return user;
    }

    public async findOneByUsername(username: string): Promise<User | undefined> {
        const query = this._db.selectFrom(this._table).where('username', '=', username).selectAll();

        const foundUser = await query.executeTakeFirst();

        if (foundUser === undefined) {
            return;
        }

        const userEntity = this._mapper.toEntity(foundUser);

        return userEntity;
    }

    public async findOneById(userId: string): Promise<User | undefined> {
        const query = this._db.selectFrom(this._table).where('id', '=', userId).selectAll();

        const foundUser = await query.executeTakeFirst();

        if (foundUser === undefined) {
            return;
        }

        const userEntity = this._mapper.toEntity(foundUser);

        return userEntity;
    }
}
