// lib/firebase.ts
import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import APP_CONFIG from "../config/app-config";

const firebaseConfig = {
  apiKey: APP_CONFIG.FIREBASE.APIKEY,
  authDomain: APP_CONFIG.FIREBASE.AUTH_DOMAIN,
  projectId: APP_CONFIG.FIREBASE.PROJECT_ID,
  storageBucket: APP_CONFIG.FIREBASE.STORAGE_BUCKET,
  messagingSenderId: APP_CONFIG.FIREBASE.MESSAGING_SENDER_ID,
  appId: APP_CONFIG.FIREBASE.APP_ID,
  measurementId: APP_CONFIG.FIREBASE.MEASUREMENT_ID,
};

const app =
  getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider };
