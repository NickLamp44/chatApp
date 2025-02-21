import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  FacebookAuthProvider,
} from "firebase/auth";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { auth, db } from "./firebase"; // Import Firebase instances

// User Registration with Email & Password
export const registerUser = async (userName, email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;

    // Save user details in Firestore
    await setDoc(doc(db, "Users", user.uid), {
      userID: user.uid,
      userName,
      email,
      createdAt: new Date(),
    });

    // Update Firebase Auth Profile
    await updateProfile(user, { displayName: userName });

    return user;
  } catch (error) {
    console.error("🔥 Error signing up:", error);
    throw error;
  }
};

// Login with Email
export const loginUserWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  } catch (error) {
    console.error("🔥 Error logging in with email:", error);
    throw error;
  }
};

// Login with Username
export const loginUserWithUsername = async (userName, password) => {
  try {
    const usersRef = collection(db, "Users");
    const q = query(usersRef, where("userName", "==", userName));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error("Username not found");
    }

    const userData = querySnapshot.docs[0].data();
    const email = userData.email;

    return await loginUserWithEmail(email, password);
  } catch (error) {
    console.error("🔥 Error logging in with username:", error);
    throw error;
  }
};

// Logout
export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("🔥 Error signing out:", error);
  }
};

// Google Authentication
export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Check if user exists in Firestore
    const userDoc = await getDoc(doc(db, "Users", user.uid));
    if (!userDoc.exists()) {
      await setDoc(doc(db, "Users", user.uid), {
        userID: user.uid,
        userName: user.email.split("@")[0],
        email: user.email,
        profilePic: user.photoURL || "",
        authProvider: "google",
        createdAt: new Date(),
      });
    }

    return user;
  } catch (error) {
    console.error("🔥 Error with Google sign-in:", error);
    throw error;
  }
};

// Facebook Authentication
export const signInWithFacebook = async () => {
  try {
    const provider = new FacebookAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const userDoc = await getDoc(doc(db, "Users", user.uid));
    if (!userDoc.exists()) {
      await setDoc(doc(db, "Users", user.uid), {
        userID: user.uid,
        userName: user.email.split("@")[0],
        email: user.email,
        profilePic: user.photoURL || "",
        authProvider: "facebook",
        createdAt: new Date(),
      });
    }

    return user;
  } catch (error) {
    console.error("🔥 Error with Facebook sign-in:", error);
    throw error;
  }
};
