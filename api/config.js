import dbConnect from './_utils/dbConnect.js';
import StoreConfig from './_models/StoreConfig.js';
import { logger } from './_utils/logger.js';

export default async function handler(req, res) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      let config = await StoreConfig.findOne({ id: 'global' });
      if (!config) {
        config = await StoreConfig.create({ id: 'global' });
      }
      res.status(200).json(config);
    } catch (error) {
      logger.error('API: Config', `GET Request Failed at ${new Date().toISOString()}`, error);
      res.status(500).json({ error: error.message });
    }
  } else if (req.method === 'PUT') {
    try {
      const updatedConfig = await StoreConfig.findOneAndUpdate(
        { id: 'global' },
        req.body,
        { new: true, upsert: true }
      );
      res.status(200).json(updatedConfig);
    } catch (error) {
      logger.error('API: Config', `PUT Request Failed at ${new Date().toISOString()}`, error);
      res.status(500).json({ error: error.message });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}
