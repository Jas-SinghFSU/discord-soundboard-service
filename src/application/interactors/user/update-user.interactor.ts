import { Inject, Injectable } from '@nestjs/common';
import { Interactor } from '../interactor.interface';
import { User } from 'src/domain/entities/user/user.entity';
import { UpdateUserInteractorProps } from './user-interactor.types';
import { UserRepository } from 'src/domain/ports/repositories';
import { RepositoryTokens } from 'src/infrastructure/database/database.constants';

@Injectable()
export class UpdateUserInteractor implements Interactor<UpdateUserInteractorProps, User> {
    constructor(@Inject(RepositoryTokens.USER) private readonly _userRepository: UserRepository) {}

    public async execute(userProps: UpdateUserInteractorProps): Promise<User> {
        const foundUser = await this._getUserById(userProps.id);

        await this._ensureNoUserConflict(foundUser);

        foundUser.update(userProps.userData);

        const newUserEntity = await this._userRepository.create(foundUser);

        return newUserEntity;
    }

    private async _ensureNoUserConflict(user: User): Promise<void> {
        const userResponse = await this._userRepository.findOneByUsername(user.username);

        if (userResponse !== undefined) {
            throw new Error(
                `Failed to update user. A user with the username '${user.username}' already exists.`,
            );
        }
    }

    private async _getUserById(userId: string): Promise<User> {
        const foundUser = await this._userRepository.findOneById(userId);

        if (foundUser === undefined) {
            throw new Error(`Failed to update user. User with ID '${userId}' not found.`);
        }

        return foundUser;
    }
}
