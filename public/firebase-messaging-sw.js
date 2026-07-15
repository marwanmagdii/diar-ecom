importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.2.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyBgNVPsj31RmhBr7zlq_a4ado34Wc7zL_0",
  authDomain: "diar-ecom.firebaseapp.com",
  projectId: "diar-ecom",
  storageBucket: "diar-ecom.firebasestorage.app",
  messagingSenderId: "236353227079",
  appId: "1:236353227079:web:c87798cc2cf24f60f5a462"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification.body || 'You have a new message.',
    data: payload.data
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
