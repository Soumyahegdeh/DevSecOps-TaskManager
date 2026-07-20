"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
// import type { Request, Response } from 'express';
const logger_1 = require("./config/logger");
const rate_limiter_1 = require("./config/rate-limiter");
const db_1 = __importDefault(require("./drizzle/db"));
const schema_1 = require("./drizzle/schema");
const cors_1 = __importDefault(require("cors"));
const auth_router_1 = __importDefault(require("./auth/auth.router"));
const tasks_router_1 = __importDefault(require("./tasks/tasks.router"));
const category_router_1 = __importDefault(require("./category/category.router"));
const prometheus_1 = require("./middleware/prometheus");
const prom_client_1 = __importDefault(require("prom-client"));
const initilizeApp = () => {
    const app = (0, express_1.default)();
    app.use(express_1.default.json());
    app.use((0, cors_1.default)({
        origin: '*',
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
    }));
    app.use(logger_1.logger);
    // Rate Limiter middleware
    app.use(rate_limiter_1.rateLimiterMiddleware);
    // Use Prometheus middleware
    app.use(prometheus_1.prometheusMiddleware);
    // NEW: Metrics endpoint for Prometheus
    app.get('/metrics', async (req, res) => {
        try {
            res.set('Content-Type', prom_client_1.default.register.contentType);
            res.end(await (0, prometheus_1.getMetrics)());
        }
        catch (error) {
            res.status(500).end(error);
        }
    });
    // Database connection test route
    app.get('/test-db', async (req, res) => {
        try {
            console.log('Testing database connection...');
            const result = await db_1.default.select().from(schema_1.users).limit(1);
            console.log('Database connection successful:', result);
            res.json({ success: true, result });
        }
        catch (err) {
            console.error('Database connection failed:', err);
            if (err instanceof Error) {
                res.status(500).json({ success: false, error: err.message });
            }
            else {
                res.status(500).json({ success: false, error: 'Unknown database error' });
            }
        }
    });
    // routes
    app.use('/auth', auth_router_1.default);
    app.use('/tasks', tasks_router_1.default);
    app.use('/categories', category_router_1.default);
    app.get('/', (req, res) => {
        res.send('Hello, World!');
    });
    // Health check endpoint for Docker
    app.get('/health', (req, res) => {
        res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
    });
    return app;
};
const app = initilizeApp();
exports.default = app;
