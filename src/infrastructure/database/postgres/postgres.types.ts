import { Transaction as KyselyTransaction } from 'kysely';
import { Transaction as TransactionPort } from 'src/domain/ports/transactions/transaction.interface';
import { PostgresDb } from './tables';

export enum PostgresTables {
    USERS = 'users',
    AUDIO_COMMANDS = 'audio_commands',
    AUDIO_DATA = 'audio_data',
}

export interface PostgresTransaction extends TransactionPort {
    transaction: KyselyTransaction<PostgresDb>;
}
