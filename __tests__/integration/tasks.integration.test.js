"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const server_1 = __importDefault(require("../../src/server"));
const db_1 = __importDefault(require("../../src/drizzle/db"));
const schema_1 = require("../../src/drizzle/schema");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const drizzle_orm_1 = require("drizzle-orm");
describe('Tasks Integration Tests', () => {
    let authToken;
    let userId;
    let categoryId;
    beforeEach(async () => {
        // Clean up database
        await db_1.default.delete(schema_1.tasks);
        await db_1.default.delete(schema_1.categories);
        await db_1.default.delete(schema_1.users);
        // Create test user with unique email
        const hashedPassword = await bcryptjs_1.default.hash('password123', 10);
        const uniqueEmail = `john-${Date.now()}@example.com`;
        const [user] = await db_1.default.insert(schema_1.users).values({
            fullname: 'John Doe',
            email: uniqueEmail,
            password: hashedPassword,
            role: 'user',
            isActive: true,
        }).returning();
        userId = user.id;
        // Login to get token
        const loginResponse = await (0, supertest_1.default)(server_1.default)
            .post('/auth/login')
            .send({
            email: uniqueEmail,
            password: 'password123',
        });
        authToken = loginResponse.body.token;
        // Create test category
        const [category] = await db_1.default.insert(schema_1.categories).values({
            name: 'Work',
            description: 'Work-related tasks',
            color: '#FF5733',
            userId: userId,
        }).returning();
        categoryId = category.id;
    });
    afterEach(async () => {
        // Clean up after each test
        await db_1.default.delete(schema_1.tasks);
        await db_1.default.delete(schema_1.categories);
        await db_1.default.delete(schema_1.users);
    });
    afterAll(async () => {
        // Clean up after all tests
        await db_1.default.delete(schema_1.tasks);
        await db_1.default.delete(schema_1.categories);
        await db_1.default.delete(schema_1.users);
    });
    describe('POST /tasks', () => {
        it('should create a new task successfully', async () => {
            const taskData = {
                title: 'Complete project documentation',
                description: 'Write comprehensive documentation for the API',
                status: 'todo',
                dueDate: '2024-12-31T23:59:59.000Z',
                priority: 'HIGH',
                categoryId: categoryId,
            };
            const response = await (0, supertest_1.default)(server_1.default)
                .post('/tasks')
                .set('Authorization', `Bearer ${authToken}`)
                .send(taskData)
                .expect(201);
            expect(response.body).toHaveProperty('message');
            expect(response.body.task).toMatchObject({
                title: 'Complete project documentation',
                description: 'Write comprehensive documentation for the API',
                status: 'todo',
                priority: 'HIGH',
                categoryId: categoryId,
                userId: userId,
                completed: false,
            });
            expect(response.body.task).toHaveProperty('id');
            expect(response.body.task).toHaveProperty('createdAt');
            // Verify task was created in database
            const dbTasks = await db_1.default.select().from(schema_1.tasks).where((0, drizzle_orm_1.eq)(schema_1.tasks.userId, userId));
            expect(dbTasks).toHaveLength(1);
            expect(dbTasks[0].title).toBe('Complete project documentation');
        });
        it('should return 400 for invalid task data', async () => {
            const invalidTaskData = {
                title: '', // Invalid: empty title
                status: 'invalid-status',
                priority: 'INVALID',
            };
            const response = await (0, supertest_1.default)(server_1.default)
                .post('/tasks')
                .set('Authorization', `Bearer ${authToken}`)
                .send(invalidTaskData)
                .expect(400);
            expect(response.body).toHaveProperty('error', 'Validation failed');
            expect(response.body).toHaveProperty('details');
        });
        it('should return 401 without authentication', async () => {
            const taskData = {
                title: 'Test Task',
                status: 'todo',
                priority: 'MEDIUM',
            };
            const response = await (0, supertest_1.default)(server_1.default)
                .post('/tasks')
                .send(taskData)
                .expect(401);
            expect(response.body).toHaveProperty('error');
        });
        it('should return 400 for non-existent category', async () => {
            const taskData = {
                title: 'Test Task',
                status: 'todo',
                priority: 'MEDIUM',
                categoryId: 999, // Non-existent category
            };
            const response = await (0, supertest_1.default)(server_1.default)
                .post('/tasks')
                .set('Authorization', `Bearer ${authToken}`)
                .send(taskData)
                .expect(400);
            expect(response.body).toHaveProperty('error');
        });
    });
    describe('GET /tasks', () => {
        beforeEach(async () => {
            // Create test tasks
            await db_1.default.insert(schema_1.tasks).values([
                {
                    title: 'Task 1',
                    description: 'First task',
                    status: 'todo',
                    priority: 'HIGH',
                    userId: userId,
                    categoryId: categoryId,
                    completed: false,
                    dueDate: new Date('2024-12-31T23:59:59.000Z'),
                },
                {
                    title: 'Task 2',
                    description: 'Second task',
                    status: 'in-progress',
                    priority: 'MEDIUM',
                    userId: userId,
                    categoryId: categoryId,
                    completed: false,
                    dueDate: new Date('2024-12-31T23:59:59.000Z'),
                },
                {
                    title: 'Task 3',
                    description: 'Third task',
                    status: 'completed',
                    priority: 'LOW',
                    userId: userId,
                    categoryId: categoryId,
                    completed: true,
                    dueDate: new Date('2024-12-31T23:59:59.000Z'),
                },
            ]);
        });
        it('should return all tasks for authenticated user', async () => {
            const response = await (0, supertest_1.default)(server_1.default)
                .get('/tasks')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body).toHaveLength(3);
            // Verify task structure
            response.body.forEach((task) => {
                expect(task).toHaveProperty('id');
                expect(task).toHaveProperty('title');
                expect(task).toHaveProperty('status');
                expect(task).toHaveProperty('priority');
                expect(task).toHaveProperty('userId', userId);
                expect(task).toHaveProperty('categoryId', categoryId);
            });
        });
        it('should not return tasks from other users', async () => {
            // Create another user and their task
            const hashedPassword = await bcryptjs_1.default.hash('password123', 10);
            const [otherUser] = await db_1.default.insert(schema_1.users).values({
                fullname: 'Jane Doe',
                email: 'jane@example.com',
                password: hashedPassword,
                role: 'user',
                isActive: true,
            }).returning();
            await db_1.default.insert(schema_1.tasks).values({
                title: 'Other User Task',
                status: 'todo',
                priority: 'HIGH',
                userId: otherUser.id,
                categoryId: categoryId,
                completed: false,
                dueDate: new Date('2024-12-31T23:59:59.000Z'),
            });
            const response = await (0, supertest_1.default)(server_1.default)
                .get('/tasks')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);
            expect(response.body).toHaveLength(3);
            response.body.forEach((task) => {
                expect(task.userId).toBe(userId);
            });
        });
    });
    describe('GET /tasks/:id', () => {
        let taskId;
        beforeEach(async () => {
            const [task] = await db_1.default.insert(schema_1.tasks).values({
                title: 'Test Task',
                description: 'Test description',
                status: 'todo',
                priority: 'HIGH',
                userId: userId,
                categoryId: categoryId,
                completed: false,
                dueDate: new Date('2024-12-31T23:59:59.000Z'),
            }).returning();
            taskId = task.id;
        });
        it('should return specific task', async () => {
            const response = await (0, supertest_1.default)(server_1.default)
                .get(`/tasks/${taskId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);
            expect(response.body).toMatchObject({
                id: taskId,
                title: 'Test Task',
                description: 'Test description',
                status: 'todo',
                priority: 'HIGH',
                userId: userId,
                categoryId: categoryId,
                completed: false,
            });
        });
        it('should return 404 for non-existent task', async () => {
            const response = await (0, supertest_1.default)(server_1.default)
                .get('/tasks/999')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(404);
            expect(response.body).toHaveProperty('error', 'Task not found or not owned by user');
        });
        it('should return 404 for task belonging to another user', async () => {
            // Create another user and their task
            const hashedPassword = await bcryptjs_1.default.hash('password123', 10);
            const [otherUser] = await db_1.default.insert(schema_1.users).values({
                fullname: 'Jane Doe',
                email: 'jane@example.com',
                password: hashedPassword,
                role: 'user',
                isActive: true,
            }).returning();
            const [otherTask] = await db_1.default.insert(schema_1.tasks).values({
                title: 'Other User Task',
                status: 'todo',
                priority: 'HIGH',
                userId: otherUser.id,
                categoryId: categoryId,
                completed: false,
                dueDate: new Date('2024-12-31T23:59:59.000Z'),
            }).returning();
            const response = await (0, supertest_1.default)(server_1.default)
                .get(`/tasks/${otherTask.id}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(404);
            expect(response.body).toHaveProperty('error', 'Task not found or not owned by user');
        });
    });
    describe('PUT /tasks/:id', () => {
        let taskId;
        beforeEach(async () => {
            const [task] = await db_1.default.insert(schema_1.tasks).values({
                title: 'Test Task',
                description: 'Test description',
                status: 'todo',
                priority: 'HIGH',
                userId: userId,
                categoryId: categoryId,
                completed: false,
                dueDate: new Date('2024-12-31T23:59:59.000Z'),
            }).returning();
            taskId = task.id;
        });
        it('should update task successfully', async () => {
            const updateData = {
                title: 'Updated Task',
                status: 'in-progress',
                priority: 'MEDIUM',
            };
            const response = await (0, supertest_1.default)(server_1.default)
                .put(`/tasks/${taskId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData)
                .expect(200);
            expect(response.body).toHaveProperty('message');
            // Verify task was updated in database
            const [updatedTask] = await db_1.default.select().from(schema_1.tasks).where((0, drizzle_orm_1.eq)(schema_1.tasks.id, taskId));
            expect(updatedTask.title).toBe('Updated Task');
            expect(updatedTask.status).toBe('in-progress');
            expect(updatedTask.priority).toBe('MEDIUM');
        });
        it('should return 404 for non-existent task', async () => {
            const updateData = {
                title: 'Updated Task',
            };
            const response = await (0, supertest_1.default)(server_1.default)
                .put('/tasks/999')
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData)
                .expect(404);
            expect(response.body).toHaveProperty('error', 'Task not found or not owned by user');
        });
    });
    describe('DELETE /tasks/:id', () => {
        let taskId;
        beforeEach(async () => {
            const [task] = await db_1.default.insert(schema_1.tasks).values({
                title: 'Test Task',
                status: 'todo',
                priority: 'HIGH',
                userId: userId,
                categoryId: categoryId,
                completed: false,
                dueDate: new Date('2024-12-31T23:59:59.000Z'),
            }).returning();
            taskId = task.id;
        });
        it('should delete task successfully', async () => {
            const response = await (0, supertest_1.default)(server_1.default)
                .delete(`/tasks/${taskId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);
            expect(response.body).toHaveProperty('message');
            // Verify task was deleted from database
            const dbTasks = await db_1.default.select().from(schema_1.tasks).where((0, drizzle_orm_1.eq)(schema_1.tasks.id, taskId));
            expect(dbTasks).toHaveLength(0);
        });
        it('should return 404 for non-existent task', async () => {
            const response = await (0, supertest_1.default)(server_1.default)
                .delete('/tasks/999')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(404);
            expect(response.body).toHaveProperty('error', 'Task not found or not owned by user');
        });
    });
    describe('GET /tasks/status/:status', () => {
        beforeEach(async () => {
            await db_1.default.insert(schema_1.tasks).values([
                {
                    title: 'Todo Task 1',
                    status: 'todo',
                    priority: 'HIGH',
                    userId: userId,
                    categoryId: categoryId,
                    completed: false,
                    dueDate: new Date('2024-12-31T23:59:59.000Z'),
                },
                {
                    title: 'Todo Task 2',
                    status: 'todo',
                    priority: 'MEDIUM',
                    userId: userId,
                    categoryId: categoryId,
                    completed: false,
                    dueDate: new Date('2024-12-31T23:59:59.000Z'),
                },
                {
                    title: 'In Progress Task',
                    status: 'in-progress',
                    priority: 'LOW',
                    userId: userId,
                    categoryId: categoryId,
                    completed: false,
                    dueDate: new Date('2024-12-31T23:59:59.000Z'),
                },
            ]);
        });
        it('should return tasks by status', async () => {
            const response = await (0, supertest_1.default)(server_1.default)
                .get('/tasks/status/todo')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body).toHaveLength(2);
            response.body.forEach((task) => {
                expect(task.status).toBe('todo');
                expect(task.userId).toBe(userId);
            });
        });
        it('should return empty array for status with no tasks', async () => {
            const response = await (0, supertest_1.default)(server_1.default)
                .get('/tasks/status/completed')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body).toHaveLength(0);
        });
    });
    describe('GET /tasks/priority/:priority', () => {
        beforeEach(async () => {
            await db_1.default.insert(schema_1.tasks).values([
                {
                    title: 'High Priority Task 1',
                    status: 'todo',
                    priority: 'HIGH',
                    userId: userId,
                    categoryId: categoryId,
                    completed: false,
                    dueDate: new Date('2024-12-31T23:59:59.000Z'),
                },
                {
                    title: 'High Priority Task 2',
                    status: 'in-progress',
                    priority: 'HIGH',
                    userId: userId,
                    categoryId: categoryId,
                    completed: false,
                    dueDate: new Date('2024-12-31T23:59:59.000Z'),
                },
                {
                    title: 'Medium Priority Task',
                    status: 'todo',
                    priority: 'MEDIUM',
                    userId: userId,
                    categoryId: categoryId,
                    completed: false,
                    dueDate: new Date('2024-12-31T23:59:59.000Z'),
                },
            ]);
        });
        it('should return tasks by priority', async () => {
            const response = await (0, supertest_1.default)(server_1.default)
                .get('/tasks/priority/HIGH')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body).toHaveLength(2);
            response.body.forEach((task) => {
                expect(task.priority).toBe('HIGH');
                expect(task.userId).toBe(userId);
            });
        });
        it('should return 400 for invalid priority', async () => {
            const response = await (0, supertest_1.default)(server_1.default)
                .get('/tasks/priority/INVALID')
                .set('Authorization', `Bearer ${authToken}`)
                .expect(400);
            expect(response.body).toHaveProperty('error', 'Invalid priority value');
        });
    });
});
