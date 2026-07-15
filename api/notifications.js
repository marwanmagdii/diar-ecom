import admin from 'firebase-admin';

// Initialize Firebase Admin only once
if (!admin.apps.length) {
  try {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (serviceAccount) {
      const credentials = JSON.parse(serviceAccount);
      admin.initializeApp({
        credential: admin.credential.cert(credentials)
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
    if (!admin.apps.length) {
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

    if (productId) {
      message.data = {
        url: `/products/${productId}`
      };
    } else {
      message.data = {
        url: `/`
      };
    }

    // Send multicast message
    const response = await admin.messaging().sendMulticast(message);

    return res.status(200).json({
      success: true,
      successCount: response.successCount,
      failureCount: response.failureCount,
      responses: response.responses
    });

  } catch (error) {
    console.error('Error sending push notification:', error);
    return res.status(500).json({ error: error.message });
  }
}
