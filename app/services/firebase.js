import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  disableNetwork,
  enableNetwork,
} from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, initializeAuth } from "firebase/auth";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { FIREBASE_CONFIG } from "../../config/constants";

// Ensure Firebase is initialized only once
const app = !getApps().length ? initializeApp(FIREBASE_CONFIG) : getApp();

// Firebase services
const db = getFirestore(app);
const storage = getStorage(app);
const auth =
  getApps().length === 0
    ? initializeAuth(app, { persistence: ReactNativeAsyncStorage })
    : getAuth(app);

// Function to handle network toggling (removed `useNetInfo()`)
const handleNetworkStatus = (isConnected) => {
  if (isConnected === false) {
    disableNetwork(db);
  } else {
    enableNetwork(db);
  }
};

export { db, storage, auth, handleNetworkStatus };
