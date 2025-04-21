import { Inject, Injectable } from '@nestjs/common';
import { User } from 'src/domain/entities/user/user.entity';
import { CreateUserProps } from 'src/domain/entities/user/user.types';
import { UserRepository } from 'src/domain/ports/repositories';
import { RepositoryTokens } from 'src/infrastructure/database/database.constants';
import { Interactor } from '../interactor.interface';

@Injectable()
export class CreateUserInteractor implements Interactor<CreateUserProps, User> {
    constructor(
        @Inject(RepositoryTokens.USER)
        private readonly _userRepository: UserRepository,
    ) {}

    public async execute(userProps: CreateUserProps): Promise<User> {
        await this._ensureNoUserConflict(userProps);

        const userEntity = User.create(userProps);

        const newUserEntity = await this._userRepository.create(userEntity);

        return newUserEntity;
    }

    private async _ensureNoUserConflict(userProps: CreateUserProps): Promise<void> {
        const username = userProps.username;
        const userResponse = await this._userRepository.findOneByUsername(username);

        if (userResponse !== undefined) {
            throw new Error(`Failed to create user. A user with the username '${username}' already exists.`);
        }
    }
}
