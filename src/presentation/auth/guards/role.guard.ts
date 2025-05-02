import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RoleGuard implements CanActivate {
    constructor(private _configService: ConfigService) {}

    public async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredRoles = this._configService.get<string>('REQUIRED_DISCORD_ROLES')?.split(',') || [];

        if (requiredRoles.length === 0) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (user === undefined || user.roles === undefined) {
            throw new UnauthorizedException('User not authenticated or missing role data');
        }

        const hasRequiredRole = user.roles.some((role: string) => requiredRoles.includes(role));

        if (hasRequiredRole === false) {
            throw new UnauthorizedException('Insufficient permissions');
        }

        return true;
    }
}
