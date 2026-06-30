import dbConnect from './api/_utils/dbConnect.js';
import StoreConfig from './api/_models/StoreConfig.js';

async function test() {
  await dbConnect();
  
  const config = await StoreConfig.findOne({ id: 'global' });
  const updatedLocations = config.locations.map(loc => {
    if (loc.id === 'cairo') {
      return { ...loc, isActive: false };
    }
    return loc;
  });

  const reqBody = { locations: updatedLocations };

  // This is what the API does exactly
  const updated = await StoreConfig.findOneAndUpdate(
    { id: 'global' },
    reqBody,
    { new: true, upsert: true }
  );
  
  console.log('Cairo isActive after API-like PUT:', updated.locations.find(l => l.id === 'cairo').isActive);
  process.exit();
}

test();
