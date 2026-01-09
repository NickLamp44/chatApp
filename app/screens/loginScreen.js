"use client";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Alert,
  TouchableOpacity,
} from "react-native";
import {
  loginUserWithEmail,
  loginUserWithUsername,
  signInWithGoogle,
} from "../services/firebaseAuth";
import { AntDesign } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";

// ===== MAIN COMPONENT =====
export default function Login({ navigation }) {
  const [input, setInput] = useState("");
  const [password, setPassword] = useState("");

  // Handles standard email/username + password login
  const handleStandardLogin = async () => {
    if (!input || !password) {
      Alert.alert("❌ Error", "Please enter Username/Email & Password.");
      return;
    }

    try {
      const isEmail = input.includes("@");

      let user;
      if (isEmail) {
        user = await loginUserWithEmail(input, password);
      } else {
        user = await loginUserWithUsername(input, password);
      }

      const userData = {
        userID: user.uid,
        name: user.displayName || user.email.split("@")[0],
        email: user.email,
        profilePic: user.photoURL || "",
        isGuest: false,
      };

      console.log("✅ Login Successful", userData);

      await AsyncStorage.setItem("user", JSON.stringify(userData));
      navigation.navigate("HomeScreen", userData);
    } catch (error) {
      Alert.alert("❌ Login Failed", error.message);
    }
  };

  // Handles Google OAuth login
  const handleGoogleLogin = async () => {
    try {
      const user = await signInWithGoogle();

      const userData = {
        userID: user.uid,
        name: user.displayName || user.email.split("@")[0],
        email: user.email,
        profilePic: user.photoURL,
        isGuest: false,
      };

      console.log("✅ Google Login Successful", userData);

      await AsyncStorage.setItem("user", JSON.stringify(userData));
      navigation.navigate("HomeScreen", userData);
    } catch (error) {
      Alert.alert("❌ Google Login Failed", error.message);
    }
  };

  // Handles Guest login
  const handleGuestLogin = async () => {
    // Ensure Firebase session is cleared
    await signOut(auth);

    const guestUserData = {
      userID: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name: "",
      email: "",
      profilePic: "",
      isGuest: true,
    };

    console.log("✅ Guest Login", guestUserData);

    await AsyncStorage.setItem("user", JSON.stringify(guestUserData));
    navigation.navigate("HomeScreen", guestUserData);
  };

  // ===== UI RENDER =====
  return (
    <View style={styles.container}>
      <View style={styles.loginContainer}>
        <Text style={styles.title}>Welcome to Circle Up!</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter Email or Username"
          autoCapitalize="none"
          value={input}
          onChangeText={setInput}
        />

        <TextInput
          style={styles.input}
          placeholder="Enter Password"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity
          style={styles.loginButton}
          onPress={handleStandardLogin}
        >
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <Text style={styles.orText}>OR</Text>

        <TouchableOpacity
          style={styles.googleButton}
          onPress={handleGoogleLogin}
        >
          <AntDesign name="google" size={20} color="white" />
          <Text style={styles.buttonText}>Sign in with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleGuestLogin}>
          <Text style={styles.buttonText}>Continue as Guest</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
          <Text style={styles.signupText}>Don't have an account? Sign up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ===== STYLES SECTION =====
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#b1b1b1",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loginContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 32,
    width: "100%",
    maxWidth: 480,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#333",
    marginBottom: 32,
    textAlign: "center",
  },
  input: {
    width: "100%",
    backgroundColor: "#f8f8f8",
    marginBottom: 16,
    fontSize: 16,
    color:"#999",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 14,
  },
  orText: {
    fontSize: 14,
    color: "#666",
    marginVertical: 16,
    fontWeight: "600",
  },
  loginButton: {
    backgroundColor: "#3a58c7",
    padding: 14,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginBottom: 8,
  },
  button: {
    backgroundColor: "#757083",
    padding: 14,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginBottom: 8,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "#DB4437",
    padding: 14,
    borderRadius: 8,
    width: "100%",
    marginBottom: 8,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  signupText: {
    marginTop: 16,
    fontSize: 14,
    color: "#3a58c7",
    textDecorationLine: "underline",
  },
});
