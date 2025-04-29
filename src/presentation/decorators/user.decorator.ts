import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { User } from 'src/domain/entities/user/user.entity';

export const AuthUser = createParamDecorator((_data: unknown, executionContext: ExecutionContext): User => {
    const request = executionContext.switchToHttp().getRequest();

    if (!(request.user instanceof User)) {
        throw new UnauthorizedException('Invalid user session');
    }

    const userEntity: User = request.user;

    return userEntity;
});
