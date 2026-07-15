import dbConnect from '../_utils/dbConnect.js';
import NotificationHistory from '../_models/NotificationHistory.js';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    await dbConnect();

    // Fetch all history records sorted by newest first
    const history = await NotificationHistory.find().sort({ sentAt: -1 }).lean();

    return res.status(200).json(history);
  } catch (error) {
    console.error('Error fetching notification history:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
