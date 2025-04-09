import mongoose from 'mongoose';
import { UserDocument } from '../database/models/user.model';
import { Request } from 'express';

declare global {
  namespace Express {
    interface User extends UserDocument {
      id?: string;
    }
    interface Request {
      id?: string;
      sessionId?: string;
    }
  }
}
