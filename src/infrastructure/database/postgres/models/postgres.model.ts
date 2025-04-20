import { PostgresTables } from '../postgres.types';
import { PostgresAudioCommand } from './postgres-audio-command.model';
import { PostgresUser } from './postgres-user.model';

export interface PostgresDb {
    [PostgresTables.USERS]: PostgresUser;
    [PostgresTables.AUDIO_COMMANDS]: PostgresAudioCommand;
}
