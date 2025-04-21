import { Kysely, sql } from 'kysely';
import { PostgresDb } from '../../tables';
import { PostgresTables } from '../../postgres.types';

export async function createUsersTable(kysely: Kysely<PostgresDb>): Promise<void> {
    await kysely.schema
        .createTable(PostgresTables.USERS)
        .addColumn('id', 'text', (col) => col.primaryKey())
        .addColumn('username', 'text', (col) => col.notNull())
        .addColumn('display_name', 'text', (col) => col.notNull())
        .addColumn('avatar', 'text')
        .addColumn('provider', 'text', (col) => col.notNull())
        .addColumn('entry_audio', 'text')
        .addColumn('volume', 'integer', (col) => col.notNull().defaultTo(100))
        .addColumn('play_on_entry', 'boolean', (col) => col.notNull().defaultTo(false))
        .addColumn('favorites', sql`text[]`, (col) => col.notNull().defaultTo(sql`'{}'`))
        .ifNotExists()
        .execute();
}
