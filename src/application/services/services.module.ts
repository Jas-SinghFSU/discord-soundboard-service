import { Module } from '@nestjs/common';
import { InteractorsModule } from '../interactors/interactors.module';
import { AuthService } from './auth.service';
import { CreateUserInteractor, GetUserInteractor, UpdateUserInteractor } from '../interactors/user';

const authServiceProvider = {
    provide: AuthService,
    useFactory: (
        createUserInteractor: CreateUserInteractor,
        updateUserInteractor: UpdateUserInteractor,
        getUserInteractor: GetUserInteractor,
    ): AuthService => new AuthService(createUserInteractor, updateUserInteractor, getUserInteractor),
    inject: [CreateUserInteractor, UpdateUserInteractor, GetUserInteractor],
};

@Module({
    imports: [InteractorsModule],
    providers: [authServiceProvider],
    exports: [AuthService],
})
export class ServicesModule {}
