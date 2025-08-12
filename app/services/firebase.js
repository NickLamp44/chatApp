import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { firebaseConfig } from "../../config/constants";

// 🔥 Initialize Firebase safely (prevents re-init during Fast Refresh)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

console.log("🔥 Firebase Initialized:", app.name);
console.log("✅ Firestore DB:", db);

// Export Firebase instances
export { db, auth };
