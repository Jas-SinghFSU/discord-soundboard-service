import { Pool } from 'pg';
import { Kysely, PostgresDialect } from 'kysely';
import { PostgresDb } from './models/postgres.model';

export function createDb(pool: Pool): Kysely<PostgresDb> {
    return new Kysely<PostgresDb>({
        dialect: new PostgresDialect({ pool }),
    });
}
