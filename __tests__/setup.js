"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const db_1 = require("../src/drizzle/db");
// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key';
process.env.DATABASE_URL = 'postgresql://taskuser:taskpassword@localhost:5432/taskdb_test';
// Global test timeout
jest.setTimeout(30000);
// Global teardown to close database connections
afterAll(async () => {
    try {
        await db_1.client.end();
    }
    catch (error) {
        console.error('Error disconnecting from database:', error);
    }
});
