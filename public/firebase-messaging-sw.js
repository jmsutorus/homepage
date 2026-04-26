importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyDbPSktlZS5pc7tyyPehz4CrU_euTLsfLc",
  authDomain: "homepage-7cfc8.firebaseapp.com",
  projectId: "homepage-7cfc8",
  storageBucket: "gs://homepage-7cfc8.firebasestorage.app",
  messagingSenderId: "705251858590",
  appId: "1:705251858590:web:ebe81b632199e584f6c38f"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

// onBackgroundMessage fires when a push arrives while the app is in the background.
// IMPORTANT: return the showNotification promise so the SW stays alive long enough
// to actually render the notification. Without returning it, the SW can terminate
// before the OS has a chance to display the alert.
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);
  console.log('[firebase-messaging-sw.js] Notification permission state:', Notification.permission);

  const title = payload.notification?.title || payload?.data?.title || 'Notification';
  console.log('[firebase-messaging-sw.js] Resolving alert titled:', title);


  // The FCM message in this app sends icon under webpush.notification,
  // not the top-level notification object — read from the correct path.
  const webpushIcon = payload?.data?.icon;
  const topLevelIcon = payload.notification?.icon;
  const icon = webpushIcon || topLevelIcon || '/favicon-96x96.png';

  const options = {
    body: payload.notification?.body || payload?.data?.body || '',
    icon,
    badge: '/favicon-96x96.png',

    // Store the clickAction URL so notificationclick can open it.
    data: {
      clickAction: payload.notification?.click_action
        || payload?.data?.clickAction
        || '/',
      ...payload.data,
    },
  };

  // Return the promise — this is the critical fix.
  // event.waitUntil is handled internally by the compat SDK only if we return a promise here.
  return self.registration.showNotification(title, options);
});

// When the user taps the notification, open/focus the app and navigate to the target URL.
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.clickAction || '/';
  const origin = self.location.origin;
  const fullUrl = targetUrl.startsWith('http') ? targetUrl : `${origin}${targetUrl}`;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If a window is already open to this URL, focus it
      for (const client of windowClients) {
        if (client.url === fullUrl && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (clients.openWindow) {
        return clients.openWindow(fullUrl);
      }
    })
  );
});
