import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

let cachedConn = null;

export const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return true;
  }

  const uri = process.env.MONGODB_URI;

  if (!uri || uri === 'your-connection-string-here' || (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://'))) {
    console.warn('⚠️ MONGODB_URI is using placeholder or is unconfigured in .env / Vercel settings');
    return false;
  }

  try {
    if (!cachedConn) {
      cachedConn = await mongoose.connect(uri, {
        bufferCommands: false,
        serverSelectionTimeoutMS: 5000
      });
    }
    console.log(`✅ MongoDB connected: ${mongoose.connection.host}`);
    return true;
  } catch (error) {
    console.error(`⚠️ MongoDB connection error: ${error.message}`);
    return false;
  }
};

export const isMongoReady = () => {
  return mongoose.connection && mongoose.connection.readyState === 1;
};
