importScripts(
  "https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js",
);

console.log("🚀 Service Worker initializing...");

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBQZoA1lhg8TZ0jIAkRrn_QgW8nmpp0XeQ",
  authDomain: "mahally-notification.firebaseapp.com",
  projectId: "mahally-notification",
  messagingSenderId: "893549676994",
  appId: "1:893549676994:web:1a66a47ab644619c6bee5b",
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
messaging.onBackgroundMessage((payload) => {
  console.log("📬 Background message received:", payload);

  const notificationTitle = payload.data?.title || "Notification";
  const notificationOptions = {
    body: payload.data?.body || "",
    icon: payload.data?.icon || "/icon-192x192.png",
    badge: "/badge-72x72.png",
    tag: "order-notification", // ✅ تغيير: tag فريد للـ orders
    requireInteraction: true,
    data: {
      orderId: payload.data?.orderId, // ✅ حفظ orderId
      type: payload.data?.type || "notification",
      ...payload.data,
    },
  };

  console.log("🔔 Showing notification:", notificationTitle);
  return self.registration.showNotification(
    notificationTitle,
    notificationOptions,
  );
});

// ✅ Handle notification click - روح للـ order
self.addEventListener("notificationclick", (event) => {
  console.log("🖱️ Notification clicked");
  event.notification.close();

  const orderId = event.notification.data?.orderId;
  const url = orderId
    ? `/dashboard/orders?id=${orderId}` // ✅ روح للـ order مباشرة
    : "/dashboard";

  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        // شيك إذا في tab مفتوح بالفعل
        for (let client of clientList) {
          if (client.url.includes("/dashboard") && "focus" in client) {
            client.postMessage({ type: "NAVIGATE", url }); // ✅ أخبره يروح للـ page
            return client.focus();
          }
        }
        // إذا ما في tab، افتح واحد جديد
        return clients.openWindow(url);
      }),
  );
});

console.log("✅ Service Worker ready");
