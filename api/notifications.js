import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';
import dbConnect from './_utils/dbConnect.js';
import StoreConfig from './_models/StoreConfig.js';
import NotificationHistory from './_models/NotificationHistory.js';

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

    const { title, body, imageUrl, tokens, productId, targetType } = req.body;

    if (!tokens || !Array.isArray(tokens) || tokens.length === 0) {
      return res.status(400).json({ error: 'No tokens provided' });
    }

    await dbConnect();

    // Create History Record
    const historyRecord = await NotificationHistory.create({
      title: title || 'New Notification',
      body: body || '',
      imageUrl: imageUrl || null,
      productId: productId || null,
      targetType: targetType || 'all',
      successCount: 0,
      failureCount: 0,
      clicks: []
    });

    // Deduplicate tokens
    const uniqueTokens = Array.from(new Set(tokens));

    const baseUrl = req.headers.origin || 'https://diar-romya.vercel.app';

    const message = {
      notification: {
        title: title || 'New Notification',
        body: body || '',
      },
      tokens: uniqueTokens,
      data: {
        url: productId ? `/product/${productId}` : `/`,
        notificationId: historyRecord._id.toString()
      },
      webpush: {
        headers: { Urgency: 'high' },
        notification: {
          title: title || 'New Notification',
          body: body || '',
          icon: 'https://diar-romya.vercel.app/logo.png',
          vibrate: [200, 100, 200]
        },
        fcmOptions: {
          link: productId ? `${baseUrl}/product/${productId}` : `${baseUrl}/`
        }
      }
    };

    if (imageUrl) {
      message.notification.imageUrl = imageUrl;
      message.webpush.notification.image = imageUrl;
    }

    // Force Android to deliver immediately, bypassing Doze/Battery saver
    message.android = {
      priority: 'high',
      notification: {
        sound: 'default'
      }
    };

    // Firebase sendEach limits to 500 messages per call
    const CHUNK_SIZE = 500;
    let totalSuccess = 0;
    let totalFailure = 0;
    let allResponses = [];

    for (let i = 0; i < uniqueTokens.length; i += CHUNK_SIZE) {
      const chunk = uniqueTokens.slice(i, i + CHUNK_SIZE);
      const messages = chunk.map(token => {
        // Deep copy the base message
        const individualMessage = JSON.parse(JSON.stringify(message));
        individualMessage.token = token;
        delete individualMessage.tokens; // Remove the tokens array from the base message
        // Inject the specific token into the data payload so the Service Worker knows who clicked
        individualMessage.data.token = token;
        return individualMessage;
      });
      
      const response = await getMessaging().sendEach(messages);
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

    // Update History Record with final counts
    try {
      await NotificationHistory.findByIdAndUpdate(historyRecord._id, {
        successCount: totalSuccess,
        failureCount: totalFailure
      });
    } catch (err) {
      console.error('Failed to update history record counts:', err);
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
