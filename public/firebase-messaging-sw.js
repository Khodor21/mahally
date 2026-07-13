// /public/firebase-messaging-sw.js
// Firebase Cloud Messaging Service Worker - FINAL VERSION
// Use importScripts, NOT ES6 imports!

importScripts(
  "https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js",
);

console.log("🚀 Service Worker initializing...");

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDummyKey", // Doesn't matter - public anyway
  authDomain: "dummy.firebaseapp.com",
  projectId: "dummy",
  messagingSenderId: "123456",
  appId: "1:123456:web:abc",
};

try {
  firebase.initializeApp(firebaseConfig);
  console.log("✅ Firebase initialized in Service Worker");
} catch (error) {
  console.warn("⚠️ Firebase already initialized or error:", error.message);
}

// Get messaging instance
const messaging = firebase.messaging();
console.log("✅ Firebase Messaging ready");

// CRITICAL: Handle background messages
// This fires when app is CLOSED/MINIMIZED
messaging.onBackgroundMessage((payload) => {
  console.log("📬 Background message received:", payload);

  // FIXED: Reading from payload.data instead of payload.notification.
  // This pairs with a data-only payload from your backend to prevent double notifications.
  const notificationTitle = payload.data?.title || "Notification";
  const notificationOptions = {
    body: payload.data?.body || "",
    icon: payload.data?.icon || "/icon-192x192.png",
    badge: "/badge-72x72.png",
    tag: "notification",
    requireInteraction: true,
    data: payload.data || {},
  };

  console.log("🔔 Showing notification:", notificationTitle);
  return self.registration.showNotification(
    notificationTitle,
    notificationOptions,
  );
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  console.log("🖱️ Notification clicked");
  event.notification.close();

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (let client of clientList) {
          if (client.url === "/" && "focus" in client) {
            return client.focus();
          }
        }
        return clients.openWindow("/");
      }),
  );
});

console.log("✅ Service Worker ready");
