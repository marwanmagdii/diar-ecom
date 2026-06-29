import { config } from 'dotenv';
import mongoose from 'mongoose';
import Product from '../api/models/Product.js';

config({ path: '.env.local' });

async function checkDb() {
  await mongoose.connect(process.env.MONGODB_URI);
  const products = await Product.find({ title: /Echo Vibe/i }).lean();
  console.log(`Found ${products.length} products`);
  for (const p of products) {
    console.log("ID:", p._id);
    console.log("Price:", p.price);
  }
  process.exit(0);
}
checkDb();
