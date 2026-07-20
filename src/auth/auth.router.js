"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const bearAuth_1 = require("../middleware/bearAuth");
const AuthRouter = (0, express_1.Router)();
// Public routes (no authentication required)
AuthRouter.post('/register', auth_controller_1.createUserController);
AuthRouter.post('/login', auth_controller_1.loginUserController);
AuthRouter.use(bearAuth_1.bothRoleAuth); // Applies to all routes below
AuthRouter.use(bearAuth_1.adminRoleAuth); // All routes below require admin role
AuthRouter.get('/users', auth_controller_1.getAllUsersController);
AuthRouter.get('/users/:id', auth_controller_1.getUserByIdController);
AuthRouter.put('/users/:id', auth_controller_1.updateUserByIdController);
AuthRouter.post('/users/:id/deactivate', auth_controller_1.deactivateUserController);
exports.default = AuthRouter;
