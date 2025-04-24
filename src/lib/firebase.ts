import { getApps, initializeApp, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

/*
 * Centralised Firebase initialisation.
 *
 * All runtime configuration comes from NEXT_PUBLIC_* environment variables so that
 * Firebase can run both on the client and on the Edge runtime / server components.
 * Ensure you have the following keys inside your local .env file (no quotes):
 *
 *  NEXT_PUBLIC_FIREBASE_API_KEY=<...>
 *  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=<...>
 *  NEXT_PUBLIC_FIREBASE_PROJECT_ID=<...>
 *  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=<...>
 *  NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=<...>
 *  NEXT_PUBLIC_FIREBASE_APP_ID=<...>
 */

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Avoid re-initialising when the module is imported multiple times (Next.js HMR).
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Export the commonly-used Firebase services.
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app; 