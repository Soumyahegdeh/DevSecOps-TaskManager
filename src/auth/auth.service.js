"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivateUserService = exports.getUserByIdService = exports.updateUserByIdService = exports.getAllUsersService = exports.userLoginService = exports.verifyUserService = exports.getUserByEmailService = exports.createUserService = void 0;
const drizzle_orm_1 = require("drizzle-orm");
const db_1 = __importDefault(require("../drizzle/db"));
const schema_1 = require("../drizzle/schema");
const createUserService = async (user) => {
    try {
        console.log('Creating user:', { email: user.email, fullname: user.fullname });
        const result = await db_1.default.insert(schema_1.users).values(user).returning();
        console.log('User created successfully:', result);
        return result[0]; // Return the created user
    }
    catch (error) {
        console.error('Error creating user:', error);
        throw error;
    }
};
exports.createUserService = createUserService;
const getUserByEmailService = async (email) => {
    try {
        console.log('Checking if user exists with email:', email);
        const result = await db_1.default.query.users.findFirst({
            where: (0, drizzle_orm_1.eq)(schema_1.users.email, email),
        });
        console.log('User lookup result:', result ? 'User found' : 'User not found');
        return result;
    }
    catch (error) {
        console.error('Error checking user by email:', error);
        throw error;
    }
};
exports.getUserByEmailService = getUserByEmailService;
const verifyUserService = async (email) => {
    await db_1.default.update(schema_1.users)
        .set({ isActive: true }) // Using isActive instead of isVerified
        .where((0, drizzle_orm_1.eq)(schema_1.users.email, email));
    return 'User verified successfully';
};
exports.verifyUserService = verifyUserService;
const userLoginService = async (email, _password) => {
    return await db_1.default.query.users.findFirst({
        columns: {
            id: true,
            fullname: true,
            email: true,
            password: true,
            role: true,
            isActive: true,
        },
        where: (0, drizzle_orm_1.eq)(schema_1.users.email, email),
    });
};
exports.userLoginService = userLoginService;
const getAllUsersService = async () => {
    return await db_1.default.query.users.findMany({
        columns: {
            id: true,
            fullname: true,
            email: true,
            role: true,
            isActive: true,
            createdAt: true,
        },
    });
};
exports.getAllUsersService = getAllUsersService;
const updateUserByIdService = async (id, user) => {
    await db_1.default.update(schema_1.users)
        .set({
        ...user,
        updatedAt: new Date(), // Auto-update the updatedAt field
    })
        .where((0, drizzle_orm_1.eq)(schema_1.users.id, id));
    return 'User updated successfully';
};
exports.updateUserByIdService = updateUserByIdService;
const getUserByIdService = async (id) => {
    return await db_1.default.query.users.findFirst({
        where: (0, drizzle_orm_1.eq)(schema_1.users.id, id),
    });
};
exports.getUserByIdService = getUserByIdService;
const deactivateUserService = async (id) => {
    await db_1.default.update(schema_1.users)
        .set({ isActive: false })
        .where((0, drizzle_orm_1.eq)(schema_1.users.id, id));
    return 'User deactivated successfully';
};
exports.deactivateUserService = deactivateUserService;
