import { config } from 'dotenv';
import mongoose from 'mongoose';
import Product from '../api/_models/Product.js';

config({ path: '.env.local' });

async function checkDb() {
  await mongoose.connect(process.env.MONGODB_URI);
  const p = await Product.findOne({ title: /Echo Vibe/i }).lean();
  
  const product = p;
  const hasVariants = product.variants && product.variants.length > 0;
  
  const selectedOptions = { Color: 'White', Material: 'Metal', Weight: '250g', Style: 'Modern' };
  
  const activeVariant = product.variants.find(v => {
    if (!v.attributes) return false;
    return Object.entries(selectedOptions).every(([k, val]) => !v.attributes[k] || v.attributes[k] === val);
  });
  
  console.log("Selected Options:", selectedOptions);
  console.log("Variant attributes:", product.variants[0].attributes);
  console.log("Active variant matched?", !!activeVariant);
  if (activeVariant) console.log("Matched variant ID:", activeVariant.id);
  
  process.exit(0);
}
checkDb();
