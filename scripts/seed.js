import { config } from 'dotenv';
import mongoose from 'mongoose';
import { products } from '../src/data.js';
import Product from '../api/models/Product.js';

// Load .env.local
config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Please define the MONGODB_URI environment variable inside .env.local');
  process.exit(1);
}

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    await Product.deleteMany({});
    console.log('Cleared existing products');

    // Fix the typo in diaper image path
    const fixedProducts = products.map(p => {
      if (p.image === '/diaper.png') {
        return { ...p, image: '/diapers.png' };
      }
      return p;
    });

    await Product.insertMany(fixedProducts);
    console.log('Successfully seeded database with products!');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
