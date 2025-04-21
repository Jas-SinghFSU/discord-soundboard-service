import { User } from 'src/domain/entities/user/user.entity';
import { Transaction as DomainTransaction } from '../transactions/transaction.interface';

/**
 * Repository for persisting and retrieving User entities.
 * Supports optional transaction context for atomic operations.
 */
export interface UserRepository {
    /**
     * Persists a new user to the data store.
     *
     * @param user        The user entity to be created.
     * @param transaction Optional transaction context. If provided, the operation participates in it.
     */
    create(user: User, transaction?: DomainTransaction): Promise<User>;

    /**
     * Retrieves a user by their unique ID.
     *
     * @param userId      The unique identifier of the user to retrieve.
     * @param transaction Optional transaction context for consistent reads.
     */
    findOneById(userId: string, transaction?: DomainTransaction): Promise<User | undefined>;

    /**
     * Retrieves a user by their username.
     *
     * @param username    The username to search for.
     * @param transaction Optional transaction context for consistent reads.
     */
    findOneByUsername(username: string, transaction?: DomainTransaction): Promise<User | undefined>;
}
