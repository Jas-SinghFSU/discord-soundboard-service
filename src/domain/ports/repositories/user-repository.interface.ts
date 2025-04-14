import { User } from 'src/domain/entities/user/user.entity';

export interface UserRepository {
    create(user: User): Promise<User>;
    findOneById(userId: string): Promise<User | undefined>;
    findOneByUsername(username: string): Promise<User | undefined>;
}
