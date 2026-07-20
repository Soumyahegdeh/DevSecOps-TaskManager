"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkPermissions = exports.bothRoleAuth = exports.userRoleAuth = exports.adminRoleAuth = exports.checkRoles = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const checkRoles = (requiredRole) => {
    return (req, res, next) => {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ message: 'Unauthorized - No token provided' });
            return;
        }
        const token = authHeader.split(' ')[1];
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            res.status(500).json({ message: 'Server configuration error' });
            return;
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, secret);
            req.user = decoded; // Attach user to request object
            // Check if user is active (if this info is in your JWT)
            // If not, you might need to query the database here
            // Role verification
            switch (requiredRole) {
                case 'both':
                    if (decoded.role === 'admin' || decoded.role === 'user') {
                        return next();
                    }
                    break;
                case 'admin':
                case 'user':
                    if (decoded.role === requiredRole) {
                        return next();
                    }
                    break;
            }
            res.status(403).json({
                message: `Forbidden - Requires ${requiredRole} role`,
                requiredRole,
                userRole: decoded.role,
            });
        }
        catch (error) {
            if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
                res.status(401).json({ message: 'Token expired' });
            }
            else if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
                res.status(401).json({ message: 'Invalid token' });
            }
            else {
                res.status(401).json({ message: 'Authentication failed' });
            }
        }
    };
};
exports.checkRoles = checkRoles;
// Specific role middlewares
exports.adminRoleAuth = (0, exports.checkRoles)('admin');
exports.userRoleAuth = (0, exports.checkRoles)('user');
exports.bothRoleAuth = (0, exports.checkRoles)('both');
// Optional: Enhanced role checker with permissions
const checkPermissions = (_requiredPermissions) => {
    return (req, res, next) => {
        // Implement permission checking logic here
        // You might want to query the database for user permissions
        next();
    };
};
exports.checkPermissions = checkPermissions;
