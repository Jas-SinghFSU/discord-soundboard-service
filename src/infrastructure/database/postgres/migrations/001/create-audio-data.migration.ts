import { Kysely } from 'kysely';
import { PostgresDb } from '../../tables';
import { PostgresTables } from '../../postgres.types';

export async function createAudioDataTable(kysely: Kysely<PostgresDb>): Promise<void> {
    await kysely.schema
        .createTable(PostgresTables.AUDIO_DATA)
        .addColumn('id', 'text', (col) =>
            col.primaryKey().references(`${PostgresTables.AUDIO_COMMANDS}.id`).onDelete('cascade'),
        )
        .addColumn('data', 'bytea', (col) => col.notNull())
        .ifNotExists()
        .execute();
}
