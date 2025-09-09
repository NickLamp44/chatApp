import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  getReactNativePersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { firebaseConfig } from "../../config/constants";
import { getStorage } from "@firebase/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// 🔥 Initialize Firebase safely (prevents re-init during Fast Refresh)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

let auth;
if (Platform.OS === "web") {
  // Use default auth for web
  auth = getAuth(app);
} else {
  // Use AsyncStorage persistence for React Native
  try {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (error) {
    // If already initialized, get existing instance
    auth = getAuth(app);
  }
}

const db = getFirestore(app);
const storage = getStorage(app);

console.log("🔥 Firebase Initialized:", app.name);
console.log("✅ Firestore DB:", db);
console.log("📦 Firebase Storage:", storage);

// Export Firebase instances
export { db, auth, storage };
