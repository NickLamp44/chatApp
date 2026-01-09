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
import { registerUser, signInWithGoogle } from "../services/firebaseAuth";

export default function SignUp({ navigation }) {
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");

  const validateInputs = () => {
    if (!email || !password || !userName) {
      Alert.alert("⚠️ Error", "Please fill in all fields.");
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      Alert.alert("⚠️ Error", "Please enter a valid email address.");
      return false;
    }

    if (
      password.length < 6 ||
      !/\d/.test(password) ||
      !/[!@#$%^&*]/.test(password)
    ) {
      Alert.alert(
        "⚠️ Weak Password",
        "Password must be at least 6 characters long, include a number, and a special character."
      );
      return false;
    }

    return true;
  };

  const onHandleSignUp = async () => {
    if (!validateInputs()) return;

    try {
      const newUser = await registerUser(
        userName.trim(),
        email.trim(),
        password
      );
      console.log("✅ User registered:", newUser.uid);
      Alert.alert("✅ Success!", "Account created!");
      navigation.replace("Login");
    } catch (error) {
      console.error("❌ Signup error:", error.message);
      Alert.alert("❌ Signup Failed", error.message);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const user = await signInWithGoogle();
      console.log("✅ Google Sign-in:", user.uid);
      Alert.alert("✅ Success!", "Signed in with Google.");
      navigation.replace("Main");
    } catch (error) {
      console.error("❌ Google Sign-in error:", error.message);
      Alert.alert("❌ Google Sign-in Failed", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.signupContainer}>
        <Text style={styles.title}>Create New Account</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter email"
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />

        <TextInput
          style={styles.input}
          placeholder="Enter username"
          autoCapitalize="none"
          value={userName}
          onChangeText={setUserName}
        />

        <TextInput
          style={styles.input}
          placeholder="Enter password"
          autoCapitalize="none"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <TouchableOpacity style={styles.button} onPress={onHandleSignUp}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.googleButton]}
          onPress={handleGoogleSignIn}
        >
          <Text style={styles.buttonText}>Sign Up with Google</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("Login")}>
          <Text style={styles.loginText}>Already have an account? Log in</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#b1b1b1",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  signupContainer: {
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
    color: "#999999",
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    padding: 14,
  },
  button: {
    backgroundColor: "#3a58c7",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
    marginVertical: 6,
  },
  googleButton: {
    backgroundColor: "#DB4437",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  loginText: {
    marginTop: 16,
    fontSize: 14,
    color: "#3a58c7",
    textDecorationLine: "underline",
  },
});
