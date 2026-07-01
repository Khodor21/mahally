// public/firebase-messaging-sw.js

// Import Firebase scripts
importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js",
);

// Make sure these match your .env.local NEXT_PUBLIC_FIREBASE_* variables
const firebaseConfig = {
  apiKey: "AIzaSyBQZoA1lhg8TZ0jIAkRrn_QgW8nmpp0XeQ",
  authDomain: "mahally-notification.firebaseapp.com",
  projectId: "mahally-notification",
  storageBucket: "mahally-notification.appspot.com",
  messagingSenderId: "893549676994",
  appId: "1:893549676994:web:1a66a47ab644619c6bee5b",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

console.log("🔥 Service Worker: Firebase initialized");

// Handle background messages (when app is NOT in focus)
messaging.onBackgroundMessage((payload) => {
  console.log("🔔 Service Worker: Background message received:", payload);

  const notificationTitle = payload.notification?.title || "Notification";
  const notificationOptions = {
    body: payload.notification?.body || "",
    icon: "/logo.png",
    badge: "/badge.png",
    // Optional: Add data to notification
    data: payload.data || {},
  };

  // Show the notification
  return self.registration.showNotification(
    notificationTitle,
    notificationOptions,
  );
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  console.log("👆 Notification clicked:", event.notification.title);

  event.notification.close();

  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      // Try to find an open window
      for (let i = 0; i < clientList.length; i++) {
        const client = clientList[i];

        // Focus existing window
        if (client.url === "/" && "focus" in client) {
          return client.focus();
        }
      }

      // If no window found, open new one
      if (clients.openWindow) {
        return clients.openWindow("/");
      }
    }),
  );
});

// Optional: Handle notification close
self.addEventListener("notificationclose", (event) => {
  console.log("✋ Notification closed:", event.notification.title);
});
