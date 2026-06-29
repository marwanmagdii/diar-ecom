import dbConnect from './utils/dbConnect.js';
import Log from './models/Log.js';
import { logger } from './utils/logger.js';

export default async function handler(req, res) {
  const { method } = req;

  await dbConnect();

  switch (method) {
    case 'GET':
      try {
        const logs = await Log.find({}).sort({ timestamp: -1 }).limit(100);
        res.status(200).json(logs);
      } catch (error) {
        logger.error('Error fetching logs:', error);
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    case 'POST':
      try {
        const log = await Log.create(req.body);
        res.status(201).json(log);
      } catch (error) {
        logger.error('Error creating log:', error);
        res.status(400).json({ success: false, error: error.message });
      }
      break;

    default:
      res.status(400).json({ success: false });
      break;
  }
}
