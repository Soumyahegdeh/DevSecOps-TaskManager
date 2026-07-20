"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskController = void 0;
const task_validator_1 = require("../validators/task.validator");
const tasks_service_1 = require("./tasks.service");
const zod_1 = require("zod");
class TaskController {
    constructor(taskService) {
        this.taskService = taskService || new tasks_service_1.TaskService();
    }
    /** List all tasks for the authenticated user */
    async getAllTasks(req, res) {
        try {
            const userId = req.user.user_id; // Use user_id from JWT payload
            const tasks = await this.taskService.getAllTasks(userId);
            res.status(200).json(tasks);
        }
        catch {
            res.status(500).json({ error: 'Failed to fetch tasks' });
        }
    }
    /** Get a specific task for the authenticated user */
    async getTaskById(req, res) {
        try {
            const userId = req.user.user_id;
            const taskId = parseInt(req.params.id);
            const task = await this.taskService.getTaskById(taskId, userId);
            if (!task) {
                return res.status(404).json({ error: 'Task not found' });
            }
            res.status(200).json(task);
        }
        catch {
            res.status(500).json({ error: 'Failed to fetch task' });
        }
    }
    /** Create a new task for the authenticated user */
    async createTask(req, res) {
        try {
            const userId = req.user.user_id;
            const input = task_validator_1.createTaskSchema.parse(req.body);
            const taskData = {
                ...input,
                userId,
                dueDate: new Date(input.dueDate),
                completed: false,
                description: input.description || null, // Convert undefined to null
            };
            const result = await this.taskService.createTask(taskData);
            if (!result.success) {
                return res.status(400).json({ error: result.message });
            }
            res.status(201).json({
                message: result.message,
                task: result.task,
            });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({
                    error: 'Validation failed',
                    details: error.issues,
                });
            }
            res.status(500).json({ error: 'Failed to create task' });
        }
    }
    /** Update a task for the authenticated user */
    async updateTask(req, res) {
        try {
            const userId = req.user.user_id;
            const taskId = parseInt(req.params.id);
            const input = task_validator_1.updateTaskSchema.parse(req.body);
            const updates = { ...input };
            if (input.dueDate) {
                updates.dueDate = new Date(input.dueDate);
            }
            if (input.description !== undefined) {
                updates.description = input.description || null; // Convert undefined to null
            }
            const result = await this.taskService.updateTask(taskId, userId, updates);
            if (!result.success) {
                return res.status(404).json({ error: result.message });
            }
            res.status(200).json({ message: result.message });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({
                    error: 'Validation failed',
                    details: error.issues,
                });
            }
            res.status(500).json({ error: 'Failed to update task' });
        }
    }
    /** Delete a task for the authenticated user */
    async deleteTask(req, res) {
        try {
            const userId = req.user.user_id;
            const taskId = parseInt(req.params.id);
            const result = await this.taskService.deleteTask(taskId, userId);
            if (!result.success) {
                return res.status(404).json({ error: result.message });
            }
            res.status(200).json({ message: result.message });
        }
        catch {
            res.status(500).json({ error: 'Failed to delete task' });
        }
    }
    /** Get tasks by status for the authenticated user */
    async getTasksByStatus(req, res) {
        try {
            const userId = req.user.user_id;
            const { status } = req.params;
            const tasks = await this.taskService.getTasksByStatus(userId, status);
            res.status(200).json(tasks);
        }
        catch {
            res.status(500).json({ error: 'Failed to fetch tasks by status' });
        }
    }
    /** Get tasks by priority for the authenticated user */
    async getTasksByPriority(req, res) {
        try {
            const userId = req.user.user_id;
            const { priority } = req.params;
            // Validate priority parameter
            if (!['LOW', 'MEDIUM', 'HIGH'].includes(priority)) {
                return res.status(400).json({ error: 'Invalid priority value' });
            }
            const tasks = await this.taskService.getTasksByPriority(userId, priority);
            res.status(200).json(tasks);
        }
        catch {
            res.status(500).json({ error: 'Failed to fetch tasks by priority' });
        }
    }
    /** Toggle completion for a task */
    async toggleTaskCompletion(req, res) {
        try {
            const userId = req.user.user_id;
            const taskId = parseInt(req.params.id);
            const { completed } = task_validator_1.taskCompletionSchema.parse(req.body);
            const result = await this.taskService.toggleTaskCompletion(taskId, userId, completed);
            if (!result.success) {
                return res.status(404).json({ error: result.message });
            }
            res.status(200).json({
                message: result.message,
                completed: result.completed,
            });
        }
        catch (error) {
            if (error instanceof zod_1.z.ZodError) {
                return res.status(400).json({
                    error: 'Validation failed',
                    details: error.issues,
                });
            }
            res.status(500).json({ error: 'Failed to update task status' });
        }
    }
    /** Get tasks due today for the authenticated user */
    async getTasksDueToday(req, res) {
        try {
            const userId = req.user.user_id;
            const tasks = await this.taskService.getTasksDueToday(userId);
            res.status(200).json(tasks);
        }
        catch {
            res.status(500).json({ error: 'Failed to fetch tasks due today' });
        }
    }
    /** Get overdue tasks for the authenticated user */
    async getOverdueTasks(req, res) {
        try {
            const userId = req.user.user_id;
            const tasks = await this.taskService.getOverdueTasks(userId);
            res.status(200).json(tasks);
        }
        catch {
            res.status(500).json({ error: 'Failed to fetch overdue tasks' });
        }
    }
}
exports.TaskController = TaskController;
