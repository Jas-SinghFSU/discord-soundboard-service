import { Injectable } from '@nestjs/common';
import {
    TransactionManager,
    Transaction as DomainTransaction,
} from 'src/domain/ports/transactions/transaction.interface';
import { PostgresConnection } from '../postgres/postgres.connection';
import { generateUuid } from 'src/shared/utils/uuid.utils';
import { PostgresTransaction } from '../postgres/postgres.types';
import { Transaction as KyselyTransaction } from 'kysely';
import { PostgresDb } from '../postgres/tables';

@Injectable()
export class PostgresTransactionManager implements TransactionManager {
    constructor(private readonly _connection: PostgresConnection) {}

    /**
     * Executes a callback within a database transaction
     *
     * The transaction is automatically committed if the callback completes successfully,
     * or rolled back if an error is thrown.
     *
     * @template T The return type of the callback
     * @param callback Function to execute within the transaction
     * @returns Promise resolving to the result of the callback
     *
     * @example
     * // Create a user and their initial audio within a transaction
     * const result = await transactionManager.asTransaction(async (transaction) => {
     *   // Both operations will be committed or rolled back together
     *   const user = await userRepository.create(userData, transaction);
     *   const audio = await audioRepository.create({
     *     name: 'Welcome Message',
     *     createdBy: user.id,
     *     format: AudioFileFormat.MP3,
     *     size: welcomeFileBuffer.length,
     *   }, welcomeFileBuffer, transaction);
     *
     *   return { user, audio };
     * });
     */
    public async asTransaction<T>(callback: TransactionCallback<T>): Promise<T> {
        const db = this._connection.db;

        return await db.transaction().execute(async (kyselyTransaction: KyselyTransaction<PostgresDb>) => {
            const transaction: PostgresTransaction = {
                id: generateUuid(),
                transaction: kyselyTransaction,
            };

            return callback(transaction);
        });
    }
}

interface TransactionCallback<T> {
    (transaction: DomainTransaction): Promise<T>;
}
