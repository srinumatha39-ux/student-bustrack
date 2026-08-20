import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI;

  if (!uri || uri === 'your-connection-string-here') {
    console.warn('⚠️ MONGODB_URI is using placeholder or is not defined in .env');
    console.warn('⚠️ Please set a valid MongoDB Atlas URI in .env (e.g., MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/bus_tracking)');
    return false;
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};
