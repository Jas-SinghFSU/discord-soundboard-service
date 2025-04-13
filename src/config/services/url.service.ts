import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NodeEnvironment } from '../../presentation/auth/auth.types';

@Injectable()
export class UrlConfigService {
    private readonly _devUiUrl: string = 'http://localhost:3333';
    private readonly _devApiUrl: string = 'http://localhost:3000';
    private _uiUrl: string;
    private _apiUrl: string;

    constructor(private readonly _configService: ConfigService) {
        this._initializeUrls();
    }

    public get uiUrl(): string {
        return this._uiUrl;
    }

    public get apiUrl(): string {
        return this._apiUrl;
    }

    /**
     * Configures the API and UI URLs based on the application's running environment.
     *
     * By checking the NODE_ENV and, if applicable, the production URL, this method directs the application
     * to use either local development URLs or the production URL for both API and UI.
     */
    private _initializeUrls(): void {
        const environment = this._configService.get<string>('NODE_ENV') ?? NodeEnvironment.DEV;
        const productionUrl = this._configService.get<string>('PRODUCTION_URL');

        if (environment === NodeEnvironment.PROD) {
            this._prodUrlInit(productionUrl);
        }

        this._uiUrl = this._devUiUrl;
        this._apiUrl = this._devApiUrl;
    }

    /**
     * Configures the URLs for a production environment.
     *
     * Ensures that a production URL is provided, throwing an error if not, so that the application
     * does not run with invalid endpoint configuration in production.
     *
     * @param productionUrl  The production URL obtained from configuration.
     */
    private _prodUrlInit(productionUrl?: string): void {
        if (productionUrl === undefined) {
            throw new Error('PRODUCTION_URL must be defined in production environment');
        }

        this._apiUrl = productionUrl;
        this._uiUrl = productionUrl;
    }
}
