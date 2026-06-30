import { config } from 'dotenv';
import mongoose from 'mongoose';
import Product from '../api/_models/Product.js';

config({ path: '.env.local' });

async function checkDb() {
  await mongoose.connect(process.env.MONGODB_URI);
  const p = await Product.findOne({ title: /Echo Vibe/i });
  console.log("Title:", p.title);
  console.log("Price:", p.price);
  console.log("Options:", JSON.stringify(p.options, null, 2));
  console.log("Variants:", JSON.stringify(p.variants, null, 2));
  console.log("Base Images:", p.images?.length);
  process.exit(0);
}
checkDb();
