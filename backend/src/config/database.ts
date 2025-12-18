import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { initializeModels, verifyCollections } from './initializeModels';

dotenv.config();

const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/lezit-transports';
    
    await mongoose.connect(mongoURI);
    
    console.log('✅ MongoDB connected successfully');
    
    // Initialize all models and indexes (ensures collections exist in production)
    try {
      await initializeModels();
      if (process.env.NODE_ENV === 'production') {
        await verifyCollections(mongoose.connection);
      }
    } catch (error) {
      console.warn('⚠️  Warning during model initialization:', error);
      // Don't throw - server can still run, collections will be created on first use
    }
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB disconnected');
    });
    
    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    console.log('⚠️ Running in demo mode without database connection');
    console.log('📝 To connect to a real database, update MONGODB_URI in your .env file');
    
    // Don't exit the process, allow the app to run in demo mode
    // process.exit(1);
  }
};

export default connectDB; 