import { config } from 'dotenv';
import mongoose from 'mongoose';

// Load the Cloud URI from .env.local
config({ path: '.env.local' });

const CLOUD_URI = process.env.MONGODB_URI;
const LOCAL_URI = 'mongodb://localhost:27017/app_dev';

if (!CLOUD_URI) {
  console.error('Please define the MONGODB_URI in .env.local');
  process.exit(1);
}

async function migrateData() {
  console.log('Starting database migration from Local to Cloud...');

  try {
    // 1. Connect to both databases
    console.log('Connecting to local database...');
    const localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
    
    console.log('Connecting to cloud database...');
    const cloudConn = await mongoose.createConnection(CLOUD_URI).asPromise();

    const localDb = localConn.db;
    const cloudDb = cloudConn.db;

    // 2. Define the collections we want to copy
    const collectionsToCopy = ['products', 'storeconfigs', 'categories', 'orders', 'logs', 'counters'];

    for (const collectionName of collectionsToCopy) {
      console.log(`\n--- Migrating collection: ${collectionName} ---`);
      
      // Fetch all documents from local
      const documents = await localDb.collection(collectionName).find({}).toArray();
      
      if (documents.length === 0) {
        console.log(`No documents found in local '${collectionName}'. Skipping.`);
        continue;
      }

      console.log(`Found ${documents.length} documents in local '${collectionName}'.`);

      // Clear the cloud collection first to prevent duplicates
      await cloudDb.collection(collectionName).deleteMany({});
      console.log(`Cleared existing data in cloud '${collectionName}'.`);

      // Insert into cloud
      await cloudDb.collection(collectionName).insertMany(documents);
      console.log(`✅ Successfully copied ${documents.length} documents to cloud '${collectionName}'.`);
    }

    console.log('\n🎉 Migration completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateData();
