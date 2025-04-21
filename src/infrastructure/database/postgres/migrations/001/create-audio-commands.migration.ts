import { Kysely } from 'kysely';
import { PostgresDb } from '../../tables';
import { PostgresTables } from '../../postgres.types';

export async function createAudioCommandsTable(kysely: Kysely<PostgresDb>): Promise<void> {
    await kysely.schema
        .createTable(PostgresTables.AUDIO_COMMANDS)
        .addColumn('id', 'text', (col) => col.primaryKey())
        .addColumn('name', 'text', (col) => col.notNull())
        .addColumn('format', 'text', (col) => col.notNull())
        .addColumn('size', 'numeric', (col) => col.notNull())
        .addColumn('created_by', 'text', (col) => col.references(`${PostgresTables.USERS}.id`).notNull())
        .addColumn('created_at', 'timestamp', (col) => col.notNull())
        .addColumn('updated_at', 'timestamp', (col) => col.notNull())
        .ifNotExists()
        .execute();
}
