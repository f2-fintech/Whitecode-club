import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAU8uuKcwZtLkeIAb7T_wT3WKoq8080OYU",
  authDomain: "trustapp-4d70a.firebaseapp.com",
  projectId: "trustapp-4d70a",
  storageBucket: "trustapp-4d70a.firebasestorage.app",
  messagingSenderId: "715671287026",
  appId: "1:715671287026:web:4f78b42439d2a0cf21cc6b",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

let analytics = null;
if (typeof window !== "undefined") {
  isSupported().then((yes) => yes && (analytics = getAnalytics(app)));
}

export { app, auth, db, storage, analytics };
