"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rateLimiterMiddleware = void 0;
const rate_limiter_flexible_1 = require("rate-limiter-flexible");
const rateLimiter = new rate_limiter_flexible_1.RateLimiterMemory({
    points: 50,
    duration: 60,
});
const rateLimiterMiddleware = async (req, res, next) => {
    try {
        await rateLimiter.consume(req.ip || 'unknown');
        console.log(`Rate limit check passed💚 for IP: ${req.ip}`);
        next();
    }
    catch {
        res.status(429).json({ error: 'Too many requests, please try again later.' });
    }
};
exports.rateLimiterMiddleware = rateLimiterMiddleware;
