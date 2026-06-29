import { config } from 'dotenv';
import mongoose from 'mongoose';
import Product from '../api/models/Product.js';

config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Please define the MONGODB_URI environment variable inside .env.local');
  process.exit(1);
}

async function fixDb() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Find all products
    const products = await Product.find({});
    let fixedCount = 0;

    for (const p of products) {
      let needsSave = false;

      // Check if reviewImages has massive base64 strings
      if (p.reviewImages && p.reviewImages.some(img => img && img.length > 100000)) {
        console.log(`Found massive review images in product ${p._id}`);
        p.reviewImages = [];
        needsSave = true;
      }

      // Check if main images are massive
      if (p.images && p.images.some(img => img && img.length > 100000)) {
        console.log(`Found massive images in product ${p._id}`);
        p.images = [];
        needsSave = true;
      }

      // Check if variant images are massive
      if (p.variants) {
        for (const v of p.variants) {
          if (v.images && v.images.some(img => img && img.length > 100000)) {
            console.log(`Found massive variant images in product ${p._id}`);
            v.images = [];
            needsSave = true;
          }
        }
      }

      if (needsSave) {
        await p.save();
        fixedCount++;
        console.log(`Fixed product ${p._id}`);
      }
    }

    console.log(`Successfully fixed ${fixedCount} products!`);
    process.exit(0);
  } catch (error) {
    console.error('Error fixing database:', error);
    process.exit(1);
  }
}

fixDb();
