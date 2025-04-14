import { Injectable, Logger } from '@nestjs/common';
import { PassportSerializer } from '@nestjs/passport';
import { User } from 'src/domain/entities/user/user.entity';
import { Done } from './auth.types';
import { GetUserInteractor } from 'src/application/interactors/user';

/**
 * Manages how user session data is handled for Passport.
 *
 * Passport requires minimal data to be stored in the session to keep its footprint small.
 *
 * This class ensures that only the essential user identifier is serialized,
 * and it retrieves the full user object when needed during deserialization.
 *
 * The nestjs framework automatically invokes this class through the passport.session() middleware.
 */
@Injectable()
export class SessionSerializer extends PassportSerializer {
    private readonly _logger: Logger = new Logger(SessionSerializer.name);

    constructor(private readonly _getUserInteractor: GetUserInteractor) {
        super();
    }

    /**
     * Stores only the user's identifier in the session.
     *
     * Since keeping session data light is crucial, this method extracts just the unique user ID
     * from the authenticated user object, ensuring quick session storage.
     *
     * @param user  The authenticated user provided by Passport.
     * @param done  Callback to store the user ID into the session.
     */
    public serializeUser(user: User, done: (err: Error | null, userId?: string) => void): void {
        this._logger.debug(`Serializing user ID: ${user.id}`);
        done(null, user.id);
    }

    /**
     * Retrieves the full user object for an authenticated request using the stored identifier.
     *
     * On subsequent requests, Passport uses the stored user ID to fetch the complete user record.
     * This method ensures that any necessary additional user details are loaded before processing the request.
     *
     * @param userId  The user ID previously stored in the session.
     * @param done    Callback to provide the fetched user object or handle an error.
     */
    public async deserializeUser(userId: string, done: Done): Promise<void> {
        this._logger.debug(`Deserializing user ID: ${userId}`);

        try {
            const user = await this._getUserInteractor.execute(userId);

            if (user === undefined) {
                this._logger.warn(`Deserialize: User not found for ID: ${userId}`);
                throw new Error(`Failed to deserialize user with with id '${userId}'. User not found.`);
            }

            done(null, user);
        } catch (error: unknown) {
            this._logger.error(
                `Deserialize Error for ID ${userId}: ${error instanceof Error ? error.message : String(error)}`,
            );
            done(error instanceof Error ? error : new Error('Deserialization error'), null);
        }
    }
}
