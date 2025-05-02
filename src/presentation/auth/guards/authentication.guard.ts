import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class AuthenticatedGuard implements CanActivate {
    public async canActivate(context: ExecutionContext): Promise<boolean> {
        const req: Request = context.switchToHttp().getRequest();

        if (!req.isAuthenticated()) {
            return false;
        }

        console.log(req.user);

        return req.isAuthenticated();
    }
}
