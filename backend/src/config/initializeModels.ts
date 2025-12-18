/**
 * Initialize All Models
 * This ensures all Mongoose models are registered and collections are created
 * Run this when the server starts to ensure all tables exist in production
 */

import User from '../models/User';
import Booking from '../models/Booking';
import Service from '../models/Service';
import Vehicle from '../models/Vehicle';
import Timeline from '../models/Timeline';
import Quotation from '../models/Quotation';
import SalesOrder from '../models/SalesOrder';
import PurchaseOrder from '../models/PurchaseOrder';
import FinancialTransaction from '../models/FinancialTransaction';
import Invoice from '../models/Invoice';
import Bill from '../models/Bill';
import Document from '../models/Document';
import Feedback from '../models/Feedback';

/**
 * Initialize all models and ensure collections exist
 * This function creates indexes and ensures collections are ready
 */
export const initializeModels = async () => {
  try {
    console.log('📦 Initializing database models and collections...');

    // Import all models (this registers them with Mongoose)
    // Models are already imported above, but we can explicitly ensure they exist
    
    // Create indexes for all collections
    // Mongoose will create these automatically when models are first used,
    // but we can force creation here to ensure they exist in production
    
    const collections = [
      { name: 'users', model: User },
      { name: 'bookings', model: Booking },
      { name: 'services', model: Service },
      { name: 'vehicles', model: Vehicle },
      { name: 'timelines', model: Timeline },
      { name: 'quotations', model: Quotation },
      { name: 'salesorders', model: SalesOrder },
      { name: 'purchaseorders', model: PurchaseOrder },
      { name: 'financialtransactions', model: FinancialTransaction },
      { name: 'invoices', model: Invoice },
      { name: 'bills', model: Bill },
      { name: 'documents', model: Document },
      { name: 'feedbacks', model: Feedback },
    ];

    // Ensure all indexes are created
    for (const collection of collections) {
      try {
        await collection.model.createIndexes();
        console.log(`✅ Indexes created for ${collection.name}`);
      } catch (error: any) {
        // Index might already exist, which is fine
        if (error.code !== 85 && error.code !== 86) {
          // Code 85/86 = index already exists
          console.warn(`⚠️  Warning creating indexes for ${collection.name}:`, error.message);
        }
      }
    }

    console.log('✅ All models initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Error initializing models:', error);
    throw error;
  }
};

/**
 * Verify all collections exist in the database
 */
export const verifyCollections = async (connection: any) => {
  try {
    const existingCollections = await connection.db.listCollections().toArray();
    const collectionNames = existingCollections.map((c: any) => c.name);

    const requiredCollections = [
      'users',
      'bookings',
      'services',
      'vehicles',
      'timelines',
      'quotations',
      'salesorders',
      'purchaseorders',
      'financialtransactions',
      'invoices',
      'bills',
      'documents',
      'feedbacks',
    ];

    console.log('\n📊 Database Collections Status:');
    requiredCollections.forEach((colName) => {
      if (collectionNames.includes(colName)) {
        console.log(`  ✅ ${colName}`);
      } else {
        console.log(`  ⚠️  ${colName} - Will be created on first use`);
      }
    });

    return true;
  } catch (error) {
    console.error('❌ Error verifying collections:', error);
    return false;
  }
};

export default initializeModels;

