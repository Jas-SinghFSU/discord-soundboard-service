import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class DiscordAuthGuard extends AuthGuard('discord') {
    public async canActivate(context: ExecutionContext): Promise<boolean> {
        const can = await super.canActivate(context);
        if (can === true) {
            const request = context.switchToHttp().getRequest();
            await super.logIn(request);
        }

        return true;
    }
}
