import { config } from 'dotenv';
import mongoose from 'mongoose';
import Product from '../api/_models/Product.js';

config({ path: '.env.local' });

async function checkDb() {
  await mongoose.connect(process.env.MONGODB_URI);
  const p = await Product.findOne({ title: /Echo Vibe/i });
  console.log("Price:", p.price);
  console.log("OfferPrice:", p.offerPrice);
  console.log("ColorPrices:", p.colorPrices);
  console.log("Variants length:", p.variants.length);
  process.exit(0);
}
checkDb();
