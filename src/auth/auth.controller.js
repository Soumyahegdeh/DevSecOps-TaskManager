"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deactivateUserController = exports.getUserByIdController = exports.updateUserByIdController = exports.getAllUsersController = exports.loginUserController = exports.createUserController = void 0;
const auth_service_1 = require("./auth.service");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
require("dotenv/config");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mailer_1 = require("../config/mailer");
const user_validator_1 = require("../validators/user.validator");
const zod_1 = require("zod");
// Create a user controller
const createUserController = async (req, res) => {
    try {
        console.log('Registration request received:', { body: req.body });
        // Validate input
        const validatedData = user_validator_1.createUserSchema.parse(req.body);
        console.log('Hashing password...');
        const hashedPassword = await bcryptjs_1.default.hash(validatedData.password, 10);
        const user = {
            ...validatedData,
            password: hashedPassword,
            isActive: true, // Set user as active by default
        };
        console.log('Checking if user already exists...');
        const existingUser = await (0, auth_service_1.getUserByEmailService)(user.email);
        if (existingUser) {
            console.log('User already exists:', user.email);
            return res.status(400).json({ message: 'User already exists' });
        }
        console.log('Creating user in database...');
        const createdUser = await (0, auth_service_1.createUserService)(user);
        console.log('User created successfully:', createdUser);
        // Send welcome email only if email configuration is available
        if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
            console.log('Email configuration found, sending welcome email...');
            try {
                await (0, mailer_1.sendEmail)(user.email, 'Welcome to our platform', `Hello ${user.fullname}, your account has been created successfully!`, `<div>
                    <h2>Welcome ${user.fullname},</h2>
                    <p>Your account has been created successfully!</p>
                    <p>You can now log in and start using our services.</p>
                    </div>`);
                console.log('Welcome email sent successfully');
            }
            catch (emailError) {
                console.error('Failed to send welcome email:', emailError);
                // Don't fail the registration if email fails
            }
        }
        else {
            console.log('Email configuration not found, skipping welcome email');
        }
        console.log('Sending success response...');
        return res.status(201).json({
            message: 'User created successfully',
            user: {
                id: createdUser.id,
                fullname: user.fullname,
                email: user.email,
                role: user.role || 'user',
            },
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                error: 'Validation failed',
                details: error.issues,
            });
        }
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return res.status(500).json({ error: errorMessage });
    }
};
exports.createUserController = createUserController;
// Login user controller
const loginUserController = async (req, res) => {
    try {
        // Validate input
        const { email, password } = user_validator_1.loginSchema.parse(req.body);
        // Check if the user exists
        const user = await (0, auth_service_1.userLoginService)(email, password);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Check if user is active
        if (!user.isActive) {
            return res.status(403).json({ message: 'Account is deactivated' });
        }
        // Verify the password
        const passwordMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        // Create a payload
        const payload = {
            sub: user.id,
            user_id: user.id,
            fullname: user.fullname,
            email: user.email,
            role: user.role,
            exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 24 hours
        };
        // Generate the JWT token
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error('JWT_SECRET is not defined');
        }
        const token = jsonwebtoken_1.default.sign(payload, secret);
        // Return the token with user info
        return res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                user_id: user.id,
                fullname: user.fullname,
                email: user.email,
                role: user.role,
            },
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                error: 'Validation failed',
                details: error.issues,
            });
        }
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return res.status(500).json({ error: errorMessage });
    }
};
exports.loginUserController = loginUserController;
// Get all users controller
const getAllUsersController = async (req, res) => {
    try {
        const users = await (0, auth_service_1.getAllUsersService)();
        return res.status(200).json(users);
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return res.status(500).json({ error: errorMessage });
    }
};
exports.getAllUsersController = getAllUsersController;
// Update user by id controller
const updateUserByIdController = async (req, res) => {
    const { id } = req.params;
    const userData = req.body;
    try {
        // Check if user exists
        const existingUser = await (0, auth_service_1.getUserByIdService)(Number(id));
        if (!existingUser) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Hash password if it's being updated
        if (userData.password) {
            userData.password = await bcryptjs_1.default.hash(userData.password, 10);
        }
        await (0, auth_service_1.updateUserByIdService)(Number(id), userData);
        return res.status(200).json({ message: 'User updated successfully' });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return res.status(500).json({ error: errorMessage });
    }
};
exports.updateUserByIdController = updateUserByIdController;
// Get user by id controller
const getUserByIdController = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await (0, auth_service_1.getUserByIdService)(Number(id));
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        return res.status(200).json({
            id: user.id,
            fullname: user.fullname,
            email: user.email,
            role: user.role,
            isActive: user.isActive,
            createdAt: user.createdAt,
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return res.status(500).json({ error: errorMessage });
    }
};
exports.getUserByIdController = getUserByIdController;
// Deactivate user controller
const deactivateUserController = async (req, res) => {
    const { id } = req.params;
    try {
        const user = await (0, auth_service_1.getUserByIdService)(Number(id));
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        await (0, auth_service_1.deactivateUserService)(Number(id));
        return res.status(200).json({ message: 'User deactivated successfully' });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return res.status(500).json({ error: errorMessage });
    }
};
exports.deactivateUserController = deactivateUserController;
