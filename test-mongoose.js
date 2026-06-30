import dbConnect from './api/_utils/dbConnect.js';
import StoreConfig from './api/_models/StoreConfig.js';

async function test() {
  await dbConnect();
  
  // Test saving location with isActive false
  const updated = await StoreConfig.findOneAndUpdate(
    { id: 'global' },
    { $set: { 'locations.0.isActive': false } },
    { new: true, upsert: true }
  );
  
  console.log('Cairo isActive:', updated.locations[0].isActive);
  process.exit();
}

test();
