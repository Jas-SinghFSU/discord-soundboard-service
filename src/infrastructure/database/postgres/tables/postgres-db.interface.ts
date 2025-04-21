import { PostgresTables } from '../postgres.types';
import { PostgresAudioCommand } from './postgres-audio-command.table';
import { PostgresAudioData } from './postgres-audio-data.table';
import { PostgresUser } from './postgres-user.table';

export interface PostgresDb {
    [PostgresTables.USERS]: PostgresUser;
    [PostgresTables.AUDIO_COMMANDS]: PostgresAudioCommand;
    [PostgresTables.AUDIO_DATA]: PostgresAudioData;
}
