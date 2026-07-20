"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMetricsContentType = exports.getMetrics = exports.prometheusMiddleware = exports.httpRequestDuration = exports.httpRequestCounter = exports.errorCount = void 0;
const prom_client_1 = __importDefault(require("prom-client"));
// Enable default metrics
prom_client_1.default.collectDefaultMetrics();
// Create a counter for errors
exports.errorCount = new prom_client_1.default.Counter({
    name: 'error_count',
    help: 'Total number of errors',
    labelNames: ['type', 'endpoint'],
});
// Create a counter for HTTP requests
exports.httpRequestCounter = new prom_client_1.default.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code'],
});
// Create a histogram for request duration
exports.httpRequestDuration = new prom_client_1.default.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route'],
    buckets: [0.1, 0.5, 1, 2, 5],
});
// Middleware to track requests
const prometheusMiddleware = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = (Date.now() - start) / 1000;
        exports.httpRequestCounter.inc({
            method: req.method,
            route: req.route?.path || req.path,
            status_code: res.statusCode,
        });
        exports.httpRequestDuration.observe({
            method: req.method,
            route: req.route?.path || req.path,
        }, duration);
    });
    next();
};
exports.prometheusMiddleware = prometheusMiddleware;
// Metrics endpoint handler
const getMetrics = async () => {
    return await prom_client_1.default.register.metrics();
};
exports.getMetrics = getMetrics;
// Function to get metrics content type
const getMetricsContentType = () => {
    return prom_client_1.default.register.contentType;
};
exports.getMetricsContentType = getMetricsContentType;
