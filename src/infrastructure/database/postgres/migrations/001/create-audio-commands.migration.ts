import { Kysely } from 'kysely';
import { PostgresDb } from '../../models';
import { PostgresTables } from '../../postgres.types';

export async function createAudioCommandsTable(kysely: Kysely<PostgresDb>): Promise<void> {
    await kysely.schema
        .createTable(PostgresTables.AUDIO_COMMANDS)
        .addColumn('id', 'text', (col) => col.primaryKey())
        .addColumn('name', 'text', (col) => col.notNull())
        .addColumn('format', 'text', (col) => col.notNull())
        .addColumn('size', 'numeric', (col) => col.notNull())
        .addColumn('created_by', 'text', (col) => col.notNull().references(`${PostgresTables.USERS}.id`))
        .addColumn('created_at', 'timestamp', (col) => col.notNull())
        .addColumn('updated_at', 'timestamp', (col) => col.notNull())
        .ifNotExists()
        .execute();
}
