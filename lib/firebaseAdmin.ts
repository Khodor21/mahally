// lib/firebase/firebaseAdmin.ts

import admin from "firebase-admin";

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

console.log("🔥 Firebase Admin Initialization:");
console.log("✅ PROJECT_ID:", projectId);
console.log("✅ CLIENT_EMAIL:", clientEmail);
console.log("✅ PRIVATE_KEY EXISTS:", !!privateKey);

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      } as admin.ServiceAccount),
    });
    console.log("✅ Firebase Admin initialized successfully");
  } catch (error) {
    console.error("❌ Firebase Admin initialization failed:", error);
  }
}

export const firebaseAdmin = admin;

export default admin;
