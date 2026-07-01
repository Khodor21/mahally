// lib/firebase/firebaseAdmin.ts

import admin from "firebase-admin";

const projectId = process.env.FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;

// FIX: Properly parse the privateKey - replace literal \n with actual newlines
const privateKey = process.env.FIREBASE_PRIVATE_KEY
  ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
  : undefined;

console.log("🔥 Firebase Admin Initialization:");
console.log("✅ PROJECT_ID:", projectId);
console.log("✅ CLIENT_EMAIL:", clientEmail);
console.log("✅ PRIVATE_KEY EXISTS:", !!privateKey);

// Validate all required fields
if (!projectId || !clientEmail || !privateKey) {
  console.error("❌ Missing Firebase credentials in environment variables");
  console.error("   projectId:", !!projectId);
  console.error("   clientEmail:", !!clientEmail);
  console.error("   privateKey:", !!privateKey);
}

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
    throw error;
  }
}

export const firebaseAdmin = admin;

export default admin;
