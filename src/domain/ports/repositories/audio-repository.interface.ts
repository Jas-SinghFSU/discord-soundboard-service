import { Audio } from 'src/domain/entities/audio/audio.entity';
import { Transaction as DomainTransaction } from '../transactions/transaction.interface';

/**
 * Repository for managing Audio entities and their associated binary data.
 * Supports optional transaction context for atomic operations.
 */
export interface AudioRepository {
    /**
     * Persists a new audio entity and its associated binary data.
     *
     * @param audio       The Audio entity to persist.
     * @param data        The binary data associated with the audio (e.g. file buffer).
     * @param transaction Optional transaction context. Ensures metadata and data insertions are atomic.
     */
    create(audio: Audio, data: Buffer, transaction?: DomainTransaction): Promise<Audio>;

    /**
     * Retrieves an audio entity by its unique ID.
     *
     * @param id          The identifier of the audio record to retrieve.
     * @param transaction Optional transaction context for consistent reads.
     */
    findOneById(id: string, transaction?: DomainTransaction): Promise<Audio | undefined>;
}
