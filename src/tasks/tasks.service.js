"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TaskService = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = __importDefault(require("../drizzle/db"));
const schema_1 = require("../drizzle/schema");
class TaskService {
    // Create a new task
    async createTask(taskData) {
        try {
            // Validate required fields
            if (!taskData.title || !taskData.dueDate || !taskData.userId || !taskData.categoryId) {
                return {
                    success: false,
                    message: 'Missing required fields (title, dueDate, userId, categoryId)',
                };
            }
            const [task] = await db_1.default.insert(schema_1.tasks)
                .values({
                ...taskData,
                status: taskData.status || 'pending',
                priority: taskData.priority || 'MEDIUM',
                completed: taskData.completed || false,
            })
                .returning();
            return {
                success: true,
                message: 'Task created successfully',
                task,
            };
        }
        catch (error) {
            console.error('Error creating task:', error);
            return {
                success: false,
                message: 'Failed to create task',
            };
        }
    }
    // Get all tasks for a user
    async getAllTasks(userId) {
        try {
            return await db_1.default.select().from(schema_1.tasks)
                .where((0, drizzle_orm_1.eq)(schema_1.tasks.userId, userId))
                .orderBy((0, drizzle_orm_1.asc)(schema_1.tasks.dueDate), (0, drizzle_orm_1.asc)(schema_1.tasks.priority));
        }
        catch (error) {
            console.error('Error fetching tasks:', error);
            return [];
        }
    }
    // Get task by ID with user ownership check
    async getTaskById(id, userId) {
        try {
            const result = await db_1.default.select().from(schema_1.tasks)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.tasks.id, id), (0, drizzle_orm_1.eq)(schema_1.tasks.userId, userId)));
            return result[0] || null;
        }
        catch (error) {
            console.error(`Error fetching task ${id}:`, error);
            return null;
        }
    }
    // Update a task
    async updateTask(id, userId, updates) {
        try {
            const result = await db_1.default.update(schema_1.tasks)
                .set({
                ...updates,
                updatedAt: new Date(), // Always update the timestamp
            })
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.tasks.id, id), (0, drizzle_orm_1.eq)(schema_1.tasks.userId, userId)))
                .returning();
            if (result.length === 0) {
                return { success: false, message: 'Task not found or not owned by user' };
            }
            return { success: true, message: 'Task updated successfully' };
        }
        catch (error) {
            console.error(`Error updating task ${id}:`, error);
            return { success: false, message: 'Failed to update task' };
        }
    }
    // Delete a task
    async deleteTask(id, userId) {
        try {
            const result = await db_1.default.delete(schema_1.tasks)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.tasks.id, id), (0, drizzle_orm_1.eq)(schema_1.tasks.userId, userId)))
                .returning();
            if (result.length === 0) {
                return { success: false, message: 'Task not found or not owned by user' };
            }
            return { success: true, message: 'Task deleted successfully' };
        }
        catch (error) {
            console.error(`Error deleting task ${id}:`, error);
            return { success: false, message: 'Failed to delete task' };
        }
    }
    // Toggle task completion status
    async toggleTaskCompletion(id, userId, completed) {
        try {
            const task = await this.getTaskById(id, userId);
            if (!task) {
                return { success: false, message: 'Task not found' };
            }
            const newCompletedStatus = completed !== undefined ? completed : !task.completed;
            const result = await db_1.default.update(schema_1.tasks)
                .set({
                completed: newCompletedStatus,
                updatedAt: new Date(),
            })
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.tasks.id, id), (0, drizzle_orm_1.eq)(schema_1.tasks.userId, userId)))
                .returning();
            return {
                success: true,
                message: 'Task status updated',
                completed: result[0].completed,
            };
        }
        catch (error) {
            console.error(`Error toggling task ${id}:`, error);
            return { success: false, message: 'Failed to update task status' };
        }
    }
    // Get tasks by status
    async getTasksByStatus(userId, status) {
        try {
            return await db_1.default.select().from(schema_1.tasks)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.tasks.userId, userId), (0, drizzle_orm_1.eq)(schema_1.tasks.status, status)));
        }
        catch (error) {
            console.error('Error fetching tasks by status:', error);
            return [];
        }
    }
    // Get tasks by priority
    async getTasksByPriority(userId, priority) {
        try {
            return await db_1.default.select().from(schema_1.tasks)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.tasks.userId, userId), (0, drizzle_orm_1.eq)(schema_1.tasks.priority, priority)));
        }
        catch (error) {
            console.error('Error fetching tasks by priority:', error);
            return [];
        }
    }
    // Get tasks due today
    async getTasksDueToday(userId) {
        try {
            const today = new Date();
            const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59, 999);
            return await db_1.default.select().from(schema_1.tasks)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.tasks.userId, userId), (0, drizzle_orm_1.gte)(schema_1.tasks.dueDate, startOfDay), (0, drizzle_orm_1.lte)(schema_1.tasks.dueDate, endOfDay)))
                .orderBy((0, drizzle_orm_1.asc)(schema_1.tasks.priority), (0, drizzle_orm_1.asc)(schema_1.tasks.dueDate));
        }
        catch (error) {
            console.error('Error fetching tasks due today:', error);
            return [];
        }
    }
    // Get overdue tasks
    async getOverdueTasks(userId) {
        try {
            const now = new Date();
            return await db_1.default.select().from(schema_1.tasks)
                .where((0, drizzle_orm_1.and)((0, drizzle_orm_1.eq)(schema_1.tasks.userId, userId), (0, drizzle_orm_1.lt)(schema_1.tasks.dueDate, now), (0, drizzle_orm_1.eq)(schema_1.tasks.completed, false)))
                .orderBy((0, drizzle_orm_1.asc)(schema_1.tasks.dueDate), (0, drizzle_orm_1.asc)(schema_1.tasks.priority));
        }
        catch (error) {
            console.error('Error fetching overdue tasks:', error);
            return [];
        }
    }
}
exports.TaskService = TaskService;
