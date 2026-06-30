import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import mongoose from 'mongoose';
import Order from './api/_models/Order.js';

async function testClear() {
  await mongoose.connect(process.env.MONGODB_URI);
  
  // Find orders with tracking data
  const orders = await Order.find({ trackingData: { $exists: true, $ne: null } });
  console.log(`Found ${orders.length} orders with tracking data.`);
  
  if (orders.length > 0) {
    const orderToClear = orders[0];
    console.log(`Clearing order ID: ${orderToClear.id || orderToClear._id}`);
    
    // Attempt $unset
    const updated = await Order.findOneAndUpdate(
      { _id: orderToClear._id },
      { $unset: { trackingData: "" } },
      { new: true }
    );
    
    console.log(`After $unset, trackingData is:`, updated.trackingData);
  }
  
  mongoose.disconnect();
}

testClear();
