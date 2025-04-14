import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import {
    CreateUserInteractor,
    GetUserInteractor,
    UpdateUserInteractor,
} from 'src/application/interactors/user';
import { UpdateUserInteractorProps } from 'src/application/interactors/user/user-interactor.types';
import { User } from 'src/domain/entities/user/user.entity';
import { UserAttributes } from 'src/domain/entities/user/user.types';

@Injectable()
export class AuthService {
    private readonly _logger: Logger = new Logger(AuthService.name);

    constructor(
        private readonly _createUserInteractor: CreateUserInteractor,
        private readonly _updateUserInteractor: UpdateUserInteractor,
        private readonly _getUserInteractor: GetUserInteractor,
    ) {}

    /**
     * Validates an incoming user profile from an external provider and ensures a corresponding application user exists.
     *
     * This method first attempts to locate an existing user using the provider-specific identifier.
     * If found, it checks if any user details (username, displayName, avatar, etc.) need updating and applies changes accordingly.
     * If no user exists, it creates a new user based on the profile.
     *
     * @param profile  The user profile data received from an external authentication provider.
     * @returns A validated or newly created user.
     */
    public async validateOrCreateUser(profile: UserAttributes): Promise<User> {
        this._logger.debug(`Validating or creating user for provider ID: ${profile.provider}:${profile.id}`);

        try {
            let user = await this._getUserInteractor.execute(profile.id);

            if (user !== undefined) {
                user = await this._maybeUpdateUser(user, profile);
                return user;
            }

            this._logger.debug('User not found. Creating new user.');
            const newUser: User = await this._createUserInteractor.execute(profile);

            this._logger.debug(`New user created: ${newUser.id}`);
            return newUser;
        } catch (error: unknown) {
            this._logger.error(
                `Error in validateOrCreateUser for ${profile.id}: ${error instanceof Error ? error.message : String(error)}`,
            );
            throw new InternalServerErrorException('An unknown error occured while validating user.');
        }
    }

    /**
     * Conditionally updates the user record if the external profile contains new or changed data.
     *
     * This method exists to ensure that user data stays current with minimal overhead.
     * It compares key fields (username, displayName, avatar) between the stored user and the incoming profile,
     * triggering an update only when discrepancies are found.
     *
     * @param user     The existing user record.
     * @param profile  The external profile data containing potentially updated user properties.
     * @returns The updated user record if any changes were applied, otherwise the original user record.
     */
    private async _maybeUpdateUser(user: User, profile: UserAttributes): Promise<User> {
        this._logger.debug(`User found: ${user.id}. Checking for updates.`);
        const updates: Partial<UserAttributes> = {};

        if (user.username !== profile.username) {
            updates.username = profile.username;
        }
        if (user.displayName !== profile.displayName) {
            updates.displayName = profile.displayName;
        }
        if (user.avatar !== profile.avatar) {
            updates.avatar = profile.avatar;
        }

        if (Object.keys(updates).length === 0) {
            return user;
        }

        this._logger.debug(`Updating user ${user.id}`);
        const updateUserInteratorProps: UpdateUserInteractorProps = {
            id: user.id,
            userData: updates,
        };

        const updatedUser = await this._updateUserInteractor.execute(updateUserInteratorProps);

        return updatedUser;
    }
}
