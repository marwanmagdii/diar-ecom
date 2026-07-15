import dbConnect from '../_utils/dbConnect.js';
import NotificationHistory from '../_models/NotificationHistory.js';
import StoreConfig from '../_models/StoreConfig.js';

export default async function handler(req, res) {
  // CORS setup for service worker
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { notificationId, token } = req.body;

    if (!notificationId || !token) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    await dbConnect();

    // Find if the token belongs to a customer
    let userId = null;
    const config = await StoreConfig.findOne();
    if (config && config.users) {
      for (const [phone, userData] of Object.entries(config.users)) {
        if (userData.fcmTokens && Array.isArray(userData.fcmTokens) && userData.fcmTokens.includes(token)) {
          userId = phone;
          break;
        }
      }
    }

    // Push the click event to the history document
    await NotificationHistory.findByIdAndUpdate(
      notificationId,
      {
        $push: {
          clicks: {
            token,
            userId,
            clickedAt: new Date()
          }
        }
      }
    );

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error tracking click:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
