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

  if (!uri || uri === 'your-connection-string-here' || (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://'))) {
    return false;
  }

  // Auto-clean URI (remove angle brackets `<>` and encode unescaped `#` if present)
  uri = uri.replace('<', '').replace('>', '');
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
