"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.client = void 0;
require("dotenv/config");
const node_postgres_1 = require("drizzle-orm/node-postgres");
const pg_1 = require("pg");
const schema = __importStar(require("./schema"));
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    console.error('❌ DATABASE_URL environment variable is not set!');
    console.error('Please create a .env file with your Neon.tech database URL:');
    console.error('DATABASE_URL=postgres://username:password@host:port/database');
    throw new Error('DATABASE_URL environment variable is not set');
}
console.log('✅ DATABASE_URL found, attempting to connect...');
// Decide whether to use SSL: local Docker Postgres should NOT use SSL
let shouldUseSSL = false;
try {
    const url = new URL(connectionString);
    const host = url.hostname;
    const isLocalHost = ['localhost', '127.0.0.1', 'postgres'].includes(host);
    const urlForcesSSL = /sslmode=require/i.test(connectionString);
    const envForcesSSL = ['true', '1', 'require'].includes(String(process.env.DB_SSL || process.env.DATABASE_SSL || 'false').toLowerCase());
    shouldUseSSL = !isLocalHost && (envForcesSSL || urlForcesSSL);
}
catch {
    // Fallback: only use SSL if explicitly requested via env
    shouldUseSSL = ['true', '1', 'require'].includes(String(process.env.DB_SSL || process.env.DATABASE_SSL || 'false').toLowerCase());
}
exports.client = new pg_1.Client({
    connectionString,
    connectionTimeoutMillis: 10000,
    ssl: shouldUseSSL ? { rejectUnauthorized: false } : false,
});
// Test the connection (non-blocking)
exports.client.connect()
    .then(() => {
    console.log('✅ Database connected successfully!');
})
    .catch((err) => {
    console.error('❌ Database connection failed:', err.message);
    // Don't throw here - let the app start and handle DB errors gracefully
});
const db = (0, node_postgres_1.drizzle)(exports.client, { schema, logger: false });
exports.default = db;
