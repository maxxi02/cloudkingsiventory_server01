"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const asyncHandler_1 = require("./middleware/asyncHandler");
require("dotenv/config");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const app_config_1 = require("./config/app.config");
const database_1 = require("./database/database");
const errorHandler_1 = __importDefault(require("./middleware/errorHandler"));
const http_config_1 = require("./config/http.config");
const auth_routes_1 = __importDefault(require("./modules/auth/auth.routes"));
const passport_1 = __importDefault(require("passport"));
const helmet_1 = __importDefault(require("helmet"));
const jwt_strategy_1 = require("./common/strategies/jwt.strategy");
const session_routes_1 = __importDefault(require("./modules/session/session.routes"));
const mfa_routes_1 = __importDefault(require("./modules/mfa/mfa.routes"));
const app = (0, express_1.default)();
const BASE_PATH = app_config_1.config.BASE_PATH;
app.use((0, helmet_1.default)()); // Optional: add security headers
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
const allowedOrigins = [
    'http://localhost:3000', // Local development
    'https://cloudkingsinventory01.vercel.app', // Production client
];
const corsOptions = {
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: [
        'Content-Type',
        'Authorization',
        'X-Requested-With',
        'Accept',
        'Origin',
    ],
};
app.use((0, cors_1.default)(corsOptions));
app.options('*', (0, cors_1.default)(corsOptions)); // Enable preflight for all routes
app.use((0, cookie_parser_1.default)());
app.use(passport_1.default.initialize());
(0, jwt_strategy_1.setupJwtStrategy)(passport_1.default);
app.get('/', (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
    res.status(http_config_1.HTTPSTATUS.OK_BABY).json({ message: 'Hello baby' });
}));
app.get('/test', (req, res) => {
    if (req.sessionId) {
        res.json({
            message: 'Authenticated!',
            sessionId: req.sessionId,
            user: req.user,
        });
    }
});
app.use(`${BASE_PATH}/auth`, auth_routes_1.default);
app.use(`${BASE_PATH}/mfa`, mfa_routes_1.default);
app.use(`${BASE_PATH}/session`, jwt_strategy_1.authenticateJWT, session_routes_1.default);
app.use(errorHandler_1.default);
app.listen(app_config_1.config.PORT, async () => {
    try {
        await (0, database_1.connectDatabase)();
        console.log(`Server is listening on port ${app_config_1.config.PORT} in ${app_config_1.config.NODE_ENV}`);
    }
    catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1); // Exit the process if the database connection fails
    }
});
