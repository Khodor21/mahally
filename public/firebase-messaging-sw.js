importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-app-compat.js",
);
importScripts(
  "https://www.gstatic.com/firebasejs/10.13.2/firebase-messaging-compat.js",
);

const firebaseConfig = {
  apiKey: "AIzaSyBQZoA1lhg8TZ0jIAkRrn_QgW8nmpp0XeQ",
  authDomain: "mahally-notification.firebaseapp.com",
  projectId: "mahally-notification",
  storageBucket: "mahally-notification.appspot.com",
  messagingSenderId: "893549676994",
  appId: "1:893549676994:web:1a66a47ab644619c6bee5b",
};

firebase.initializeApp(firebaseConfig);
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log("Background message received:", payload);
  const notificationTitle = payload.notification?.title || "Notification";
  const notificationOptions = {
    body: payload.notification?.body || "",
    icon: "/logo.png",
    badge: "/badge.png",
  };
  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === "/" && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow("/");
      }
    }),
  );
});
