import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import dbConnect from './_utils/dbConnect.js';

// Initialize Firebase Admin only once
if (!getApps().length) {
  try {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (serviceAccount) {
      const credentials = JSON.parse(serviceAccount);
      initializeApp({
        credential: cert(credentials)
      });
    }
  } catch (err) {
    console.error("Failed to initialize Firebase Admin:", err);
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (!getApps().length) {
      return res.status(500).json({ error: 'Firebase Admin not initialized. Please add FIREBASE_SERVICE_ACCOUNT to your environment variables.' });
    }

    const { title, body, imageUrl, tokens, productId } = req.body;

    if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
      return res.status(400).json({ error: 'No tokens provided' });
    }

    // Deduplicate tokens
    const uniqueTokens = Array.from(new Set(tokens));

    const message = {
      notification: {
        title: title || 'New Notification',
        body: body || '',
      },
      tokens: uniqueTokens,
    };

    if (imageUrl) {
      message.notification.imageUrl = imageUrl;
    }

    const baseUrl = req.headers.origin || 'https://diar-romya.vercel.app';
    const linkUrl = productId ? `${baseUrl}/products/${productId}` : `${baseUrl}/`;

    if (productId) {
      message.data = { url: `/products/${productId}` };
    } else {
      message.data = { url: `/` };
    }

    // This is the OFFICIAL way to make Firebase open a URL on Web when clicked
    message.webpush = {
      headers: {
        Urgency: 'high'
      },
      notification: {
        icon: '/vite.svg',
        vibrate: [200, 100, 200]
      },
      fcmOptions: {
        link: linkUrl
      }
    };

    // Force Android to deliver immediately, bypassing Doze/Battery saver
    message.android = {
      priority: 'high',
      notification: {
        sound: 'default'
      }
    };

    // Firebase sendMulticast limits to 500 tokens per call
    const CHUNK_SIZE = 500;
    let totalSuccess = 0;
    let totalFailure = 0;
    let allResponses = [];

    for (let i = 0; i < uniqueTokens.length; i += CHUNK_SIZE) {
      const chunk = uniqueTokens.slice(i, i + CHUNK_SIZE);
      const chunkMessage = { ...message, tokens: chunk };
      
      const response = await getMessaging().sendEachForMulticast(chunkMessage);
      totalSuccess += response.successCount;
      totalFailure += response.failureCount;
      allResponses = allResponses.concat(response.responses);

      // Clean up invalid tokens automatically
      if (response.failureCount > 0) {
        const failedTokens = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(chunk[idx]);
          }
        });
        
        if (failedTokens.length > 0) {
          try {
            const StoreConfig = require('./_models/StoreConfig.js').default;
            await dbConnect();
            await StoreConfig.findOneAndUpdate(
              { id: 'global' },
              { $pullAll: { anonymousTokens: failedTokens } }
            );
          } catch (err) {
            console.error('Failed to cleanup tokens:', err);
          }
        }
      }
    }

    return res.status(200).json({
      success: true,
      successCount: totalSuccess,
      failureCount: totalFailure,
      responses: allResponses
    });

  } catch (error) {
    console.error('Error sending push notification:', error);
    return res.status(500).json({ error: error.message });
  }
}
