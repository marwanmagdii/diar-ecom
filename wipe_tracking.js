import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import mongoose from 'mongoose';
import Order from './api/_models/Order.js';

async function wipeAllTracking() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  // Find orders with tracking data
  const orders = await Order.find({ trackingData: { $exists: true, $ne: null } });
  console.log(`Found ${orders.length} orders with tracking data.`);
  
  for (let order of orders) {
    console.log(`Clearing order DB _id: ${order._id}, custom id: ${order.id}`);
    
    // Attempt $unset using Mongoose
    const updated = await Order.findByIdAndUpdate(
      order._id,
      { $unset: { trackingData: "" } },
      { new: true }
    );
    
    console.log(`After $unset, trackingData exists:`, !!updated.trackingData);
  }
  
  mongoose.disconnect();
}

wipeAllTracking();
