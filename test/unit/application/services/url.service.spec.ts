import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UrlConfigService } from 'src/application/services/url.service';
import { NodeEnvironment } from 'src/presentation/auth/auth.types';

describe('UrlConfigService', () => {
    describe('development environment', () => {
        let service: UrlConfigService;

        beforeEach(async () => {
            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    UrlConfigService,
                    {
                        provide: ConfigService,
                        useValue: {
                            get: jest.fn((key: string) => {
                                if (key === 'discord.clientID') return 'development';
                                if (key === 'productionUrl') return undefined;
                                return undefined;
                            }),
                        },
                    },
                ],
            }).compile();

            service = module.get<UrlConfigService>(UrlConfigService);
        });

        it('should set development URLs', () => {
            expect(service.uiUrl).toBe('http://localhost:3333');
            expect(service.apiUrl).toBe('http://localhost:3000/api');
        });

        it('should default to development URLs when environment is undefined', async () => {
            const module: TestingModule = await Test.createTestingModule({
                providers: [
                    UrlConfigService,
                    {
                        provide: ConfigService,
                        useValue: {
                            get: jest.fn(() => undefined),
                        },
                    },
                ],
            }).compile();

            const service = module.get<UrlConfigService>(UrlConfigService);

            expect(service.uiUrl).toBe('http://localhost:3333');
            expect(service.apiUrl).toBe('http://localhost:3000/api');
        });
    });

    describe('production environment', () => {
        describe('when productionUrl is not defined', () => {
            it('should throw an error', async () => {
                await expect(
                    Test.createTestingModule({
                        providers: [
                            UrlConfigService,
                            {
                                provide: ConfigService,
                                useValue: {
                                    get: jest.fn((key: string) => {
                                        if (key === 'discord.clientID') return NodeEnvironment.PROD;
                                        if (key === 'productionUrl') return undefined;
                                        return undefined;
                                    }),
                                },
                            },
                        ],
                    })
                        .compile()
                        .then((module) => module.get<UrlConfigService>(UrlConfigService)),
                ).rejects.toThrow('PRODUCTION_URL must be defined in production environment');
            });
        });

        describe('when productionUrl is defined', () => {
            let service: UrlConfigService;

            beforeEach(async () => {
                const module: TestingModule = await Test.createTestingModule({
                    providers: [
                        UrlConfigService,
                        {
                            provide: ConfigService,
                            useValue: {
                                get: jest.fn((key: string) => {
                                    if (key === 'discord.clientID') return NodeEnvironment.PROD;
                                    if (key === 'productionUrl') return 'https://prod.example.com';
                                    return undefined;
                                }),
                            },
                        },
                    ],
                }).compile();

                service = module.get<UrlConfigService>(UrlConfigService);
            });

            it('should set production URLs correctly', () => {
                expect(service.apiUrl).toBe('https://prod.example.com');
                expect(service.uiUrl).toBe('https://prod.example.com/api');
            });
        });
    });
});
