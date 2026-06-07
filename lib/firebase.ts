// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBQZoA1lhg8TZ0jIAkRrn_QgW8nmpp0XeQ",
  authDomain: "mahally-notification.firebaseapp.com",
  projectId: "mahally-notification",
  storageBucket: "mahally-notification.firebasestorage.app",
  messagingSenderId: "893549676994",
  appId: "1:893549676994:web:1a66a47ab644619c6bee5b",
  measurementId: "G-2430C67WC8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);