import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class DiscordAuthGuard extends AuthGuard('discord') {
    public async canActivate(context: ExecutionContext): Promise<boolean> {
        const canActivate = await super.canActivate(context);

        if (canActivate === true) {
            const request = context.switchToHttp().getRequest();

            await super.logIn(request);
        }

        return true;
    }
}
