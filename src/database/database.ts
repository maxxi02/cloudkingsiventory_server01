import mongoose from 'mongoose';
import { config } from '../config/app.config';

export const connectDatabase = async () => {
  try {
    await mongoose.connect(config.MONGO_URI);
    console.log('Connected to mongo database baby :>');
  } catch (error) {
    console.log('Something went wrong baby:', error);
    process.exit(1);
  }
};
