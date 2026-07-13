// Public/firebase-messaging-sw.js
// This file MUST be in the /public folder for Service Worker to access it

import { initializeApp } from "firebase/app";
import { getMessaging, onMessage } from "firebase/messaging";

// Firebase config (use placeholder values, will be injected)
const firebaseConfig = {
  apiKey: self.FIREBASE_API_KEY || "",
  authDomain: self.FIREBASE_AUTH_DOMAIN || "",
  projectId: self.FIREBASE_PROJECT_ID || "",
  messagingSenderId: self.FIREBASE_MESSAGING_SENDER_ID || "",
  appId: self.FIREBASE_APP_ID || "",
};

// Initialize Firebase in Service Worker context
let app;
let messaging;

try {
  app = initializeApp(firebaseConfig);
  messaging = getMessaging(app);
  console.log("✅ Firebase initialized in Service Worker");
} catch (error) {
  console.error("❌ Firebase initialization error in SW:", error);
}

// Handle background messages
self.addEventListener("push", (event) => {
  console.log("📬 Push message received in SW:", event);

  if (!event.data) {
    console.warn("⚠️ No data in push event");
    return;
  }

  let notificationData = {};

  try {
    notificationData = event.data.json();
  } catch (e) {
    // If JSON parse fails, treat as text
    notificationData = {
      title: "Notification",
      body: event.data.text(),
    };
  }

  const {
    title = "Notification",
    body = "",
    icon,
    badge,
    tag,
    requireInteraction = true,
  } = notificationData;

  const options = {
    body,
    icon: icon || "/icon-192x192.png",
    badge: badge || "/badge-72x72.png",
    tag: tag || "notification",
    requireInteraction,
    actions: [
      {
        action: "open",
        title: "Open",
      },
      {
        action: "close",
        title: "Close",
      },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  console.log("🖱️ Notification clicked:", event.notification.tag);

  event.notification.close();

  if (event.action === "close") {
    return;
  }

  // Focus or open window
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window/tab open
        for (let client of clientList) {
          if (client.url === "/" && "focus" in client) {
            return client.focus();
          }
        }
        // Otherwise, open a new window
        if (clients.openWindow) {
          return clients.openWindow("/");
        }
      }),
  );
});

self.addEventListener("notificationclose", (event) => {
  console.log("✖️ Notification closed:", event.notification.tag);
});
