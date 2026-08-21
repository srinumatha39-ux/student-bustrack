import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri === 'your-connection-string-here' || (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://'))) {
    console.warn('⚠️ MONGODB_URI is using placeholder or is unconfigured in .env');
    console.warn('⚠️ Server will operate using high-performance In-Memory Fallback store.');
    console.warn('💡 To connect real MongoDB Atlas: Set MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/bus_tracking in .env');
    return false;
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`⚠️ MongoDB connection error: ${error.message}`);
    console.warn('⚠️ Falling back to In-Memory store for continuous server operation.');
    return false;
  }
};
