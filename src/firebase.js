import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyBgNVPsj31RmhBr7zlq_a4ado34Wc7zL_0",
  authDomain: "diar-ecom.firebaseapp.com",
  projectId: "diar-ecom",
  storageBucket: "diar-ecom.firebasestorage.app",
  messagingSenderId: "236353227079",
  appId: "1:236353227079:web:c87798cc2cf24f60f5a462",
  measurementId: "G-400Q3J3V1Q"
};

const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging and get a reference to the service
let messaging = null;
try {
  messaging = getMessaging(app);
} catch (error) {
  console.error("Failed to initialize Firebase Messaging", error);
}

export const requestNotificationPermission = async () => {
  if (!messaging) return null;
  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      const currentToken = await getToken(messaging, { 
        // Provide vapidKey if needed, but Firebase can often auto-generate one if you registered in console.
        // It's recommended to provide a vapid key from Firebase Console -> Project Settings -> Cloud Messaging -> Web configuration.
        // Since we don't have it right now, we will try to get the token without it, or it will generate it.
      });
      if (currentToken) {
        console.log('FCM Token received successfully!');
        return currentToken;
      } else {
        console.log('No registration token available. Request permission to generate one.');
      }
    } else {
      console.log('Notification permission disabled/denied.');
    }
  } catch (err) {
    console.error('An error occurred while retrieving token. ', err);
  }
  return null;
};

export { messaging, onMessage };
