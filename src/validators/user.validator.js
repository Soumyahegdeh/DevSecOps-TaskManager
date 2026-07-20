"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserSchema = exports.loginSchema = exports.createUserSchema = void 0;
const zod_1 = require("zod");
exports.createUserSchema = zod_1.z.object({
    fullname: zod_1.z.string().min(1, 'Full name is required').max(100, 'Full name must be less than 100 characters'),
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(6, 'Password must be at least 6 characters'),
    role: zod_1.z.enum(['user', 'admin']).optional().default('user'),
});
exports.loginSchema = zod_1.z.object({
    email: zod_1.z.string().email('Invalid email format'),
    password: zod_1.z.string().min(1, 'Password is required'),
});
exports.updateUserSchema = zod_1.z.object({
    fullname: zod_1.z.string().min(1).max(100).optional(),
    email: zod_1.z.string().email().optional(),
    role: zod_1.z.enum(['user', 'admin']).optional(),
    isActive: zod_1.z.boolean().optional(),
});
