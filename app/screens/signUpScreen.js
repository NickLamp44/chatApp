// app/screens/signUpScreen.js

import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Alert,
  TouchableOpacity,
} from "react-native";
import {
  registerUser,
  signInWithGoogle,
  signInWithFacebook,
} from "../services/firebaseAuth";

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

  const handleFacebookSignIn = async () => {
    try {
      const user = await signInWithFacebook();
      console.log("✅ Facebook Sign-in:", user.uid);
      Alert.alert("✅ Success!", "Signed in with Facebook.");
      navigation.replace("Main");
    } catch (error) {
      console.error("❌ Facebook Sign-in error:", error.message);
      Alert.alert("❌ Facebook Sign-in Failed", error.message);
    }
  };

  return (
    <View style={styles.container}>
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

      <TouchableOpacity
        style={[styles.button, styles.facebookButton]}
        onPress={handleFacebookSignIn}
      >
        <Text style={styles.buttonText}>Sign Up with Facebook</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.loginText}>Already have an account? Log in</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 50,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#444",
    marginBottom: 20,
  },
  input: {
    width: "90%",
    backgroundColor: "#fff",
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 8,
    padding: 12,
  },
  button: {
    backgroundColor: "#6391b7",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    width: "90%",
    marginVertical: 5,
  },
  googleButton: {
    backgroundColor: "#DB4437",
  },
  facebookButton: {
    backgroundColor: "#4267B2",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  loginText: {
    marginTop: 10,
    fontSize: 16,
    color: "#444",
  },
});
