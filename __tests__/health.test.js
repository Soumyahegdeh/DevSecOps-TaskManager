"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const server_1 = __importDefault(require("../src/server"));
describe('Health Check', () => {
    it('should return 200 for health check endpoint', async () => {
        const response = await (0, supertest_1.default)(server_1.default)
            .get('/health')
            .expect(200);
        expect(response.body).toHaveProperty('status', 'healthy');
        expect(response.body).toHaveProperty('timestamp');
    });
    it('should return 200 for root endpoint', async () => {
        const response = await (0, supertest_1.default)(server_1.default)
            .get('/')
            .expect(200);
        expect(response.text).toBe('Hello, World!');
    });
    it('should return metrics endpoint', async () => {
        const response = await (0, supertest_1.default)(server_1.default)
            .get('/metrics')
            .expect(200);
        expect(response.text).toContain('# HELP');
        expect(response.text).toContain('# TYPE');
    });
});
