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

// Helper function to check if a user exists in Firestore
const getUserByUID = async (uid) => {
  const userDoc = await getDoc(doc(db, "Users", uid));
  return userDoc.exists() ? userDoc.data() : null;
};

// Helper function to check if a username is already taken
const isUsernameTaken = async (userName) => {
  const usersRef = collection(db, "Users");
  const q = query(usersRef, where("userName", "==", userName));
  const querySnapshot = await getDocs(q);
  return !querySnapshot.empty; // Returns true if username is taken
};

// Register a new user
export const registerUser = async (userName, email, password) => {
  try {
    // Check if username already exists
    if (await isUsernameTaken(userName)) {
      throw new Error(
        "🛑 Username is already taken. Please choose another. 🛑"
      );
    }

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
    console.error("🔥 Error signing up:", error.message);
    throw new Error(error.message);
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
    console.error("🔥 Error logging in with email:", error.message);
    throw new Error("Invalid email or password.");
  }
};

// Login with Username
export const loginUserWithUsername = async (userName, password) => {
  try {
    const usersRef = collection(db, "Users");
    const q = query(usersRef, where("userName", "==", userName));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error("Username not found.");
    }

    const userData = querySnapshot.docs[0].data();
    const email = userData.email;

    return await loginUserWithEmail(email, password);
  } catch (error) {
    console.error("🔥 Error logging in with username:", error.message);
    throw new Error("Invalid username or password.");
  }
};

// Logout User
export const logoutUser = async () => {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("🔥 Error signing out:", error.message);
    throw new Error("Logout failed. Please try again.");
  }
};

// Google Authentication
export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Check if user exists in Firestore
    const userDocRef = doc(db, "Users", user.uid);
    const userDoc = await getDoc(userDocRef);

    // If user doesn't exist create a new record
    if (!userDoc.exists()) {
      await setDoc(userDocRef, {
        userID: user.uid,
        userName: user.displayName || user.email.split("@")[0],
        email: user.email,
        profilePic: user.photoURL || "",
        authProvider: "google",
        createdAt: new Date(),
      });
    }

    return user;

    // Error handling
  } catch (error) {
    console.error("🔥 Error with Google sign-in:", error.message);
    throw new Error("Google sign-in failed. Please try again.");
  }
};

// Facebook Authentication
export const signInWithFacebook = async () => {
  try {
    const provider = new FacebookAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Check if user exists in Firestore
    const userDocRef = doc(db, "Users", user.uid);
    const userDoc = await getDoc(userDocRef);

    // If user doesn't exist create a new record
    if (!userDoc.exists()) {
      await setDoc(userDocRef, {
        userID: user.uid,
        userName: user.email.split("@")[0],
        email: user.email,
        profilePic: user.photoURL || "",
        authProvider: "facebook",
        createdAt: new Date(),
      });
    }

    return user;

    // Error handling
  } catch (error) {
    console.error("🔥 Error with Facebook sign-in:", error.message);
    throw new Error("Facebook sign-in failed. Please try again.");
  }
};
