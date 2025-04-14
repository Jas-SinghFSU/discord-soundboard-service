import { Module } from '@nestjs/common';
import { InteractorsModule } from '../interactors/interactors.module';
import { AuthService } from './auth.service';
import { CreateUserInteractor, GetUserInteractor, UpdateUserInteractor } from '../interactors/user';

const authServiceProvider = {
    provide: AuthService,
    useFactory: (
        createUserInteractor: CreateUserInteractor,
        getUserInteractor: GetUserInteractor,
        updateUserInteractor: UpdateUserInteractor,
    ): AuthService => new AuthService(createUserInteractor, updateUserInteractor, getUserInteractor),
    inject: [CreateUserInteractor, GetUserInteractor, UpdateUserInteractor],
};

@Module({
    imports: [InteractorsModule],
    providers: [authServiceProvider],
    exports: [AuthService],
})
export class ServicesModules {}
