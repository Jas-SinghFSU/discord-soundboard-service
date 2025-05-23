import { Controller, Get, UseGuards, Req, Res, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { UrlConfigService } from 'src/application/services/url.service';
import { DiscordAuthGuard } from '../auth/guards/discord-auth.guard';

@Controller('auth')
export class AuthController {
    private readonly _logger: Logger = new Logger(AuthController.name);
    private readonly _uiUrl: string;

    constructor(private readonly _urlService: UrlConfigService) {
        this._uiUrl = this._urlService.uiUrl;
        this._logger.log(`AuthController initialized. UI URL: ${this._uiUrl}`);
    }

    /**
     * Returns the user's authentication state to let the client adjust the UI accordingly.
     *
     * @param req  The incoming request containing user session data.
     * @returns An object with login status and, if applicable, the user data.
     */
    @Get('status')
    public checkAuthStatus(@Req() req: Request): Record<string, unknown> {
        return { authenticated: req.user !== undefined, user: req.user };
    }

    /**
     * Triggers the start of the Discord OAuth login process.
     */
    @Get('discord')
    @UseGuards(DiscordAuthGuard)
    public discordLogin(): void {
        this._logger.log('Discord login endpoint hit, guard will redirect.');
    }

    /**
     * Processes the OAuth callback from Discord and redirects the user to the UI.
     *
     * @param req  The request received after Discord authentication.
     * @param res  The response used to redirect the user.
     */
    @Get('discord/callback')
    @UseGuards(DiscordAuthGuard)
    public discordCallback(@Req() _req: Request, @Res() res: Response): void {
        res.redirect(`${this._uiUrl}/soundboard`);
    }

    /**
     * Logs the user out and terminates the session to ensure a clean state.
     *
     * @param req  The current user request.
     * @param res  The response that redirects the user post-logout.
     */
    @Get('logout')
    public logout(@Req() req: Request, @Res() res: Response): void {
        const username: string | undefined = req.user
            ? (req.user as { username: string }).username
            : undefined;

        this._logger.log(`Logout attempt for user: ${username ?? 'N/A'}`);

        req.logout((err: Error | undefined) => {
            if (err) {
                this._logger.error(`Error during req.logout for ${username ?? 'N/A'}: ${err.message}`);
                return res.redirect(`${this._uiUrl}/error?logout=failed`);
            }

            req.session.destroy((destroyErr: Error | undefined) => {
                if (destroyErr) {
                    this._logger.error(
                        `Error destroying session for ${username ?? 'N/A'}: ${destroyErr.message}`,
                    );
                    return res.redirect(`${this._uiUrl}/error?session=failed`);
                }
                this._logger.log(`Session destroyed for ${username ?? 'N/A'}. Redirecting.`);
                res.redirect(this._uiUrl);
            });
        });
    }
}
