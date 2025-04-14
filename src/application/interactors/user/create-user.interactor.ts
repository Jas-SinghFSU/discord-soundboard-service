import { Inject, Injectable } from '@nestjs/common';
import { Interactor } from '../interactor.interface';
import { User } from 'src/domain/entities/user/user.entity';
import { UserAttributes } from 'src/domain/entities/user/user.types';
import { UserRepository } from 'src/domain/ports/repositories/user-repository.interface';
import { RepositoryTokens } from 'src/infrastructure/database/database.constants';

@Injectable()
export class CreateUserInteractor implements Interactor<UserAttributes, User> {
    constructor(@Inject(RepositoryTokens.USER) private readonly _userRepository: UserRepository) {}

    public async execute(userProps: UserAttributes): Promise<User> {
        await this._ensureNoUserConflict(userProps);

        const userEntity = User.fromData(userProps);

        const newUserEntity = await this._userRepository.create(userEntity);

        return newUserEntity;
    }

    private async _ensureNoUserConflict(userProps: UserAttributes): Promise<void> {
        const username = userProps.username;
        const userResponse = await this._userRepository.findOneByUsername(username);

        if (userResponse !== undefined) {
            throw new Error(`Failed to create user. A user with the username '${username}' already exists.`);
        }
    }
}
