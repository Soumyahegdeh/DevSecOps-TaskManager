"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskCompletionSchema = exports.taskStatusSchema = exports.updateTaskSchema = exports.createTaskSchema = void 0;
const zod_1 = require("zod");
exports.createTaskSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(100),
    description: zod_1.z.string().optional().nullable(),
    status: zod_1.z.string().min(1),
    dueDate: zod_1.z.string().datetime(),
    priority: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH']),
    categoryId: zod_1.z.number().positive(),
});
exports.updateTaskSchema = zod_1.z.object({
    title: zod_1.z.string().min(1).max(100).optional(),
    description: zod_1.z.string().optional().nullable(),
    status: zod_1.z.string().min(1).optional(),
    dueDate: zod_1.z.string().datetime().optional(),
    priority: zod_1.z.enum(['LOW', 'MEDIUM', 'HIGH']).optional(),
    categoryId: zod_1.z.number().positive().optional(),
    completed: zod_1.z.boolean().optional(),
});
exports.taskStatusSchema = zod_1.z.object({
    status: zod_1.z.string().min(1),
});
exports.taskCompletionSchema = zod_1.z.object({
    completed: zod_1.z.boolean(),
});
