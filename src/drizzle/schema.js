"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tasks = exports.categories = exports.users = exports.roleEnum = exports.priorityEnum = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
// ✅ Enum
exports.priorityEnum = (0, pg_core_1.pgEnum)('priority', ['LOW', 'MEDIUM', 'HIGH']);
exports.roleEnum = (0, pg_core_1.pgEnum)('role', ['user', 'admin', 'superadmin', 'disabled']);
// User table schema
exports.users = (0, pg_core_1.pgTable)('users', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    fullname: (0, pg_core_1.text)('fullname').notNull(),
    email: (0, pg_core_1.text)('email').notNull().unique(),
    password: (0, pg_core_1.text)('password').notNull(),
    role: (0, exports.roleEnum)('role').notNull().default('user'),
    isActive: (0, pg_core_1.boolean)('is_active').notNull().default(true),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').defaultNow(),
});
// ✅ Categories table
exports.categories = (0, pg_core_1.pgTable)('categories', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    name: (0, pg_core_1.text)('name').notNull().unique(),
    description: (0, pg_core_1.text)('description').notNull(),
    color: (0, pg_core_1.text)('color').notNull().default('#FFFFFF'),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').notNull().defaultNow(),
    userId: (0, pg_core_1.integer)('user_id').notNull().references(() => exports.users.id, {
        onDelete: 'cascade',
    }),
});
// ✅ Tasks table
exports.tasks = (0, pg_core_1.pgTable)('tasks', {
    id: (0, pg_core_1.serial)('id').primaryKey(),
    title: (0, pg_core_1.text)('title').notNull(),
    description: (0, pg_core_1.text)('description'),
    status: (0, pg_core_1.text)('status').notNull(),
    dueDate: (0, pg_core_1.timestamp)('due_date').notNull(),
    priority: (0, exports.priorityEnum)('priority').notNull(),
    completed: (0, pg_core_1.boolean)('completed').notNull().default(false),
    userId: (0, pg_core_1.integer)('user_id').notNull().references(() => exports.users.id, { onDelete: 'cascade' }),
    categoryId: (0, pg_core_1.integer)('category_id').notNull().references(() => exports.categories.id, { onDelete: 'cascade' }),
    createdAt: (0, pg_core_1.timestamp)('created_at').notNull().defaultNow(),
    updatedAt: (0, pg_core_1.timestamp)('updated_at').notNull().defaultNow(),
});
