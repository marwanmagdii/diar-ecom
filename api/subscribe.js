import dbConnect from './_utils/dbConnect.js';
import StoreConfig from './_models/StoreConfig.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  await dbConnect();
  
  const { token } = req.body;
  if (!token) {
    return res.status(400).json({ error: 'Token is required' });
  }

  try {
    await StoreConfig.findOneAndUpdate(
      { id: 'global' },
      { $addToSet: { anonymousTokens: token } },
      { upsert: true }
    );
    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Error saving subscription:', err);
    return res.status(500).json({ error: err.message });
  }
}
