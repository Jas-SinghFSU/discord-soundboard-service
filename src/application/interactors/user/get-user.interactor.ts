import { Inject, Injectable } from '@nestjs/common';
import { Interactor } from '../interactor.interface';
import { User } from 'src/domain/entities/user/user.entity';
import { UserRepository } from 'src/domain/ports/repositories/user-repository.interface';
import { RepositoryTokens } from 'src/infrastructure/database/database.constants';

@Injectable()
export class GetUserInteractor implements Interactor<string, User> {
    constructor(@Inject(RepositoryTokens.USER) private readonly _userRepository: UserRepository) {}

    public async execute(userId: string): Promise<User> {
        const foundUser = await this._userRepository.findOneById(userId);

        if (foundUser === undefined) {
            throw new Error(`A user with an ID '${userId}' was not found.`);
        }

        return foundUser;
    }
}
