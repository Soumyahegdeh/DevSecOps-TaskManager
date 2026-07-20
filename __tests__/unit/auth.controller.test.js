"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_controller_1 = require("../../src/auth/auth.controller");
const authService = __importStar(require("../../src/auth/auth.service"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
// Mock dependencies
jest.mock('../../src/auth/auth.service');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
const mockAuthService = authService;
const mockBcrypt = bcryptjs_1.default;
const mockJwt = jsonwebtoken_1.default;
describe('Auth Controller - Unit Tests', () => {
    let mockReq;
    let mockRes;
    let mockJson;
    let mockStatus;
    beforeEach(() => {
        mockJson = jest.fn();
        mockStatus = jest.fn().mockReturnValue({ json: mockJson });
        mockRes = {
            status: mockStatus,
            json: mockJson,
        };
        jest.clearAllMocks();
    });
    describe('createUserController', () => {
        it('should create a user successfully', async () => {
            // Arrange
            const userData = {
                fullname: 'John Doe',
                email: 'john@example.com',
                password: 'password123',
                role: 'user',
            };
            mockReq = { body: userData };
            const hashedPassword = 'hashedPassword123';
            const createdUser = {
                id: 1,
                fullname: 'John Doe',
                email: 'john@example.com',
                password: hashedPassword,
                role: 'user',
                isActive: true,
                createdAt: new Date(),
                updatedAt: null,
            };
            mockBcrypt.hash.mockResolvedValue(hashedPassword);
            mockAuthService.getUserByEmailService.mockResolvedValue(undefined);
            mockAuthService.createUserService.mockResolvedValue(createdUser);
            // Act
            await (0, auth_controller_1.createUserController)(mockReq, mockRes);
            // Assert
            expect(mockBcrypt.hash).toHaveBeenCalledWith('password123', 10);
            expect(mockAuthService.getUserByEmailService).toHaveBeenCalledWith('john@example.com');
            expect(mockAuthService.createUserService).toHaveBeenCalledWith({
                ...userData,
                password: hashedPassword,
                isActive: true,
            });
            expect(mockStatus).toHaveBeenCalledWith(201);
            expect(mockJson).toHaveBeenCalledWith({
                message: 'User created successfully',
                user: {
                    id: 1,
                    fullname: 'John Doe',
                    email: 'john@example.com',
                    role: 'user',
                },
            });
        });
        it('should return 400 if user already exists', async () => {
            // Arrange
            const userData = {
                fullname: 'John Doe',
                email: 'john@example.com',
                password: 'password123',
            };
            mockReq = { body: userData };
            const existingUser = {
                id: 1,
                email: 'john@example.com',
                fullname: 'John Doe',
                password: 'hashedPassword',
                role: 'user',
                isActive: true,
                createdAt: new Date(),
                updatedAt: null,
            };
            mockAuthService.getUserByEmailService.mockResolvedValue(existingUser);
            // Act
            await (0, auth_controller_1.createUserController)(mockReq, mockRes);
            // Assert
            expect(mockStatus).toHaveBeenCalledWith(400);
            expect(mockJson).toHaveBeenCalledWith({ message: 'User already exists' });
            expect(mockAuthService.createUserService).not.toHaveBeenCalled();
        });
        it('should handle service errors', async () => {
            // Arrange
            const userData = {
                fullname: 'John Doe',
                email: 'john@example.com',
                password: 'password123',
            };
            mockReq = { body: userData };
            mockAuthService.getUserByEmailService.mockRejectedValue(new Error('Database error'));
            // Act
            await (0, auth_controller_1.createUserController)(mockReq, mockRes);
            // Assert
            expect(mockStatus).toHaveBeenCalledWith(500);
            expect(mockJson).toHaveBeenCalledWith({ error: 'Database error' });
        });
    });
    describe('loginUserController', () => {
        it('should login user successfully', async () => {
            // Arrange
            const loginData = {
                email: 'john@example.com',
                password: 'password123',
            };
            mockReq = { body: loginData };
            const user = {
                id: 1,
                email: 'john@example.com',
                password: 'hashedPassword123',
                fullname: 'John Doe',
                role: 'user',
                isActive: true,
                createdAt: new Date(),
                updatedAt: null,
            };
            const token = 'jwt-token-123';
            mockAuthService.userLoginService.mockResolvedValue(user);
            mockBcrypt.compare.mockResolvedValue(true);
            mockJwt.sign.mockReturnValue(token);
            // Mock environment variable
            process.env.JWT_SECRET = 'test-secret';
            // Act
            await (0, auth_controller_1.loginUserController)(mockReq, mockRes);
            // Assert
            expect(mockAuthService.userLoginService).toHaveBeenCalledWith('john@example.com', 'password123');
            expect(mockBcrypt.compare).toHaveBeenCalledWith('password123', 'hashedPassword123');
            expect(mockJwt.sign).toHaveBeenCalled();
            expect(mockStatus).toHaveBeenCalledWith(200);
            expect(mockJson).toHaveBeenCalledWith({
                message: 'Login successful',
                token,
                user: {
                    user_id: 1,
                    fullname: 'John Doe',
                    email: 'john@example.com',
                    role: 'user',
                },
            });
        });
        it('should return 404 if user not found', async () => {
            // Arrange
            const loginData = {
                email: 'nonexistent@example.com',
                password: 'password123',
            };
            mockReq = { body: loginData };
            mockAuthService.userLoginService.mockResolvedValue(undefined);
            // Act
            await (0, auth_controller_1.loginUserController)(mockReq, mockRes);
            // Assert
            expect(mockStatus).toHaveBeenCalledWith(404);
            expect(mockJson).toHaveBeenCalledWith({ message: 'User not found' });
        });
        it('should return 401 for invalid credentials', async () => {
            // Arrange
            const loginData = {
                email: 'john@example.com',
                password: 'wrongpassword',
            };
            mockReq = { body: loginData };
            const user = {
                id: 1,
                email: 'john@example.com',
                password: 'hashedPassword123',
                fullname: 'John Doe',
                role: 'user',
                isActive: true,
                createdAt: new Date(),
                updatedAt: null,
            };
            mockAuthService.userLoginService.mockResolvedValue(user);
            mockBcrypt.compare.mockResolvedValue(false);
            // Act
            await (0, auth_controller_1.loginUserController)(mockReq, mockRes);
            // Assert
            expect(mockStatus).toHaveBeenCalledWith(401);
            expect(mockJson).toHaveBeenCalledWith({ message: 'Invalid credentials' });
        });
        it('should return 403 for deactivated account', async () => {
            // Arrange
            const loginData = {
                email: 'john@example.com',
                password: 'password123',
            };
            mockReq = { body: loginData };
            const user = {
                id: 1,
                email: 'john@example.com',
                password: 'hashedPassword123',
                fullname: 'John Doe',
                role: 'user',
                isActive: false,
                createdAt: new Date(),
                updatedAt: null,
            };
            mockAuthService.userLoginService.mockResolvedValue(user);
            // Act
            await (0, auth_controller_1.loginUserController)(mockReq, mockRes);
            // Assert
            expect(mockStatus).toHaveBeenCalledWith(403);
            expect(mockJson).toHaveBeenCalledWith({ message: 'Account is deactivated' });
        });
    });
});
