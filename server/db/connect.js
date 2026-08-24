import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let isConnecting = false;

export const connectDB = async () => {
  // If already connected, return true immediately
  if (mongoose.connection && mongoose.connection.readyState === 1) {
    return true;
  }

  let uri = process.env.MONGODB_URI;

  if (!uri) {
    console.warn('⚠️ MONGODB_URI is undefined or unconfigured in environment settings.');
    return false;
  }

  // Strip quotes, brackets, and whitespace if present in environment variable
  uri = uri.trim().replace(/^["']|["']$/g, '').replace('<', '').replace('>', '');

  if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
    console.warn(`⚠️ MONGODB_URI format invalid: "${uri.substring(0, 15)}..."`);
    return false;
  }

  // Auto URL-encode '#' if present in password
  if (uri.includes('#') && !uri.includes('%23')) {
    uri = uri.replace('#', '%23');
  }

  try {
    if (!isConnecting) {
      isConnecting = true;
      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 10000,
        connectTimeoutMS: 10000
      });
      isConnecting = false;
    }
    return mongoose.connection.readyState === 1;
  } catch (error) {
    isConnecting = false;
    console.error(`⚠️ MongoDB connection error: ${error.message}`);
    return false;
  }
};

export const isMongoReady = () => {
  return Boolean(mongoose.connection && mongoose.connection.readyState === 1);
};
