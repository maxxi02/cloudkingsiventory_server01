import { asyncHandler } from './middleware/asyncHandler';
import 'dotenv/config';
import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { config } from './config/app.config';
import { connectDatabase } from './database/database';
import errorHandler from './middleware/errorHandler';
import { HTTPSTATUS } from './config/http.config';
import authRoutes from './modules/auth/auth.routes';
import passport from 'passport';
import helmet from 'helmet';

import {
  authenticateJWT,
  setupJwtStrategy,
} from './common/strategies/jwt.strategy';
import sessionRoutes from './modules/session/session.routes';
import mfaRoutes from './modules/mfa/mfa.routes';

const app = express();
const BASE_PATH = config.BASE_PATH;

app.use(helmet()); // Optional: add security headers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const allowedOrigins = [
  'http://localhost:3000', // Local development
  'https://ckinventory.vercel.app', // Production client
];

const corsOptions: cors.CorsOptions = {
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

app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Enable preflight for all routes

app.use(cookieParser());
app.use(passport.initialize());
setupJwtStrategy(passport);
app.get(
  '/',
  asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    res.status(HTTPSTATUS.OK_BABY).json({ message: 'Hello baby' });
  }),
);

app.get('/test', (req: Request, res: Response) => {
  if (req.sessionId) {
    res.json({
      message: 'Authenticated!',
      sessionId: req.sessionId,
      user: req.user,
    });
  }
});

app.use(`${BASE_PATH}/auth`, authRoutes);
app.use(`${BASE_PATH}/mfa`, mfaRoutes);
app.use(`${BASE_PATH}/session`, authenticateJWT, sessionRoutes);

app.use(errorHandler);

app.listen(config.PORT, async () => {
  try {
    await connectDatabase();
    console.log(
      `Server is listening on port ${config.PORT} in ${config.NODE_ENV}`,
    );
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1); // Exit the process if the database connection fails
  }
});
