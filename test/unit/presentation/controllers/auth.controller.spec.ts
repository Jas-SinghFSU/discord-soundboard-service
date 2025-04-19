import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from '../../../../src/presentation/controllers/auth.controller';
import { UrlConfigService } from '../../../../src/application/services/url.service';
import { Logger } from '@nestjs/common';
import { Request, Response } from 'express';

describe('AuthController', () => {
    let controller: AuthController;

    const mockUrlService = {
        uiUrl: 'http://localhost:3000',
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: UrlConfigService,
                    useValue: mockUrlService,
                },
            ],
        }).compile();

        controller = module.get<AuthController>(AuthController);
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    describe('checkAuthStatus', () => {
        it('should return logged in status and user data when authenticated', () => {
            const mockRequest = {
                isAuthenticated: () => true,
                user: { id: '123', username: 'testuser' },
            } as unknown as Request;

            const result = controller.checkAuthStatus(mockRequest);
            expect(result).toEqual({
                loggedIn: true,
                user: { id: '123', username: 'testuser' },
            });
        });

        it('should return not logged in status when not authenticated', () => {
            const mockRequest = {
                isAuthenticated: () => false,
            } as Request;

            const result = controller.checkAuthStatus(mockRequest);
            expect(result).toEqual({ loggedIn: false });
        });
    });

    describe('discordLogin', () => {
        it('should call logger when endpoint is hit', () => {
            const loggerSpy = jest.spyOn(Logger.prototype, 'log');
            controller.discordLogin();
            expect(loggerSpy).toHaveBeenCalledWith('Discord login endpoint hit, guard will redirect.');
        });
    });

    describe('discordCallback', () => {
        it('should redirect to soundboard', () => {
            const mockRequest = {} as Request;
            const mockResponse = {
                redirect: jest.fn(),
            } as unknown as Response;

            controller.discordCallback(mockRequest, mockResponse);
            expect(mockResponse.redirect).toHaveBeenCalledWith(`${mockUrlService.uiUrl}/soundboard`);
        });
    });

    describe('logout', () => {
        it('should handle successful logout and session destruction', () => {
            const mockUser = { username: 'testuser' };
            const mockRequest = {
                user: mockUser,
                logout: jest.fn((cb) => cb()),
                session: {
                    destroy: jest.fn((cb) => cb()),
                },
            } as unknown as Request;

            const mockResponse = {
                redirect: jest.fn(),
            } as unknown as Response;

            controller.logout(mockRequest, mockResponse);

            expect(mockRequest.logout).toHaveBeenCalled();
            expect(mockRequest.session.destroy).toHaveBeenCalled();
            expect(mockResponse.redirect).toHaveBeenCalledWith(mockUrlService.uiUrl);
        });

        it('should handle logout error', () => {
            const mockUser = { username: 'testuser' };
            const mockRequest = {
                user: mockUser,
                logout: jest.fn((cb) => cb(new Error('Logout failed'))),
                session: {
                    destroy: jest.fn((cb) => cb()),
                },
            } as unknown as Request;

            const mockResponse = {
                redirect: jest.fn(),
            } as unknown as Response;

            controller.logout(mockRequest, mockResponse);

            expect(mockResponse.redirect).toHaveBeenCalledWith(`${mockUrlService.uiUrl}/error?logout=failed`);
        });

        it('should handle session destruction error', () => {
            const mockUser = { username: 'testuser' };
            const mockRequest = {
                user: mockUser,
                logout: jest.fn((cb) => cb()),
                session: {
                    destroy: jest.fn((cb) => cb(new Error('Session destruction failed'))),
                },
            } as unknown as Request;

            const mockResponse = {
                redirect: jest.fn(),
            } as unknown as Response;

            controller.logout(mockRequest, mockResponse);

            expect(mockResponse.redirect).toHaveBeenCalledWith(
                `${mockUrlService.uiUrl}/error?session=failed`,
            );
        });

        it('should handle logout without user', () => {
            const mockRequest = {
                user: undefined,
                logout: jest.fn((cb) => cb()),
                session: {
                    destroy: jest.fn((cb) => cb()),
                },
            } as unknown as Request;

            const mockResponse = {
                redirect: jest.fn(),
            } as unknown as Response;

            controller.logout(mockRequest, mockResponse);

            expect(mockResponse.redirect).toHaveBeenCalledWith(mockUrlService.uiUrl);
        });
    });
});
