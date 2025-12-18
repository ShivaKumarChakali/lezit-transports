/**
 * Production Database Initialization Script
 * 
 * This script ensures all collections and indexes exist in production database
 * Run this after deploying to production or when setting up a new database
 * 
 * Usage:
 *   npm run init-db
 *   or
 *   ts-node src/scripts/initializeProductionDB.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { initializeModels, verifyCollections } from '../config/initializeModels';

// Load environment variables
dotenv.config();

const initializeProductionDatabase = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      console.error('❌ MONGODB_URI is not set in environment variables');
      process.exit(1);
    }

    console.log('🚀 Starting Production Database Initialization...');
    console.log(`📡 Connecting to: ${mongoURI.replace(/\/\/.*@/, '//***:***@')}`); // Hide credentials

    // Connect to MongoDB
    await mongoose.connect(mongoURI);

    console.log('✅ Connected to MongoDB');

    // Verify connection
    const connection = mongoose.connection;
    if (connection.readyState !== 1) {
      throw new Error('Database connection not ready');
    }

    // Verify existing collections
    await verifyCollections(connection);

    // Initialize all models and create indexes
    await initializeModels();

    // Final verification
    console.log('\n🔍 Final Collection Verification:');
    await verifyCollections(connection);

    console.log('\n✅ Production database initialization completed successfully!');
    console.log('📝 All collections and indexes are ready for use.');

    // Close connection
    await mongoose.connection.close();
    console.log('✅ Database connection closed');
    
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Error initializing production database:', error);
    process.exit(1);
  }
};

// Run if executed directly
if (require.main === module) {
  initializeProductionDatabase();
}

export default initializeProductionDatabase;

