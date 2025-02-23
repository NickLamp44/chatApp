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

  const onHandleSignUp = async () => {
    if (!email || !password || !userName) {
      Alert.alert("⚠️ Error", "Please fill in all fields.");
      return;
    }

    // Validate email input
    if (!/\S+@\S+\.\S+/.test(email)) {
      Alert.alert("⚠️ Error", "Please enter a valid email address.");
      return;
    }

    // Enforce a strong password (at least 6 chars, 1 number, 1 special char)
    if (
      password.length < 6 ||
      !/\d/.test(password) ||
      !/[!@#$%^&*]/.test(password)
    ) {
      Alert.alert(
        "⚠️ Weak Password",
        "Password must be at least 6 characters long & include a number & special character."
      );
      return;
    }

    try {
      await registerUser(userName, email, password);
      Alert.alert("✅ Success!", "Account created!");
      navigation.replace("Login");
    } catch (error) {
      Alert.alert("❌ Signup Failed", error.message);
    }
  };

  // Google Sign-in
  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      Alert.alert("✅ Success!", "Signed in with Google.");
      navigation.replace("Main");
    } catch (error) {
      Alert.alert("❌ Google Sign-in Failed", error.message);
    }
  };

  // Facebook Sign-in
  const handleFacebookSignIn = async () => {
    try {
      await signInWithFacebook();
      Alert.alert("Success!", "Signed in with Facebook.");
      navigation.replace("Main");
    } catch (error) {
      Alert.alert("❌ Facebook Sign-in Failed", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create New Account</Text>

      {/* Email Input */}
      <TextInput
        style={styles.input}
        placeholder="Enter email"
        autoCapitalize="none"
        keyboardType="email-address"
        textContentType="emailAddress"
        value={email}
        onChangeText={setEmail}
      />

      {/* Username Input */}
      <TextInput
        style={styles.input}
        placeholder="Enter Username"
        autoCapitalize="none"
        textContentType="username"
        value={userName}
        onChangeText={setUserName}
      />

      {/* Password Input */}
      <TextInput
        style={styles.input}
        placeholder="Enter password"
        autoCapitalize="none"
        secureTextEntry={true}
        textContentType="password"
        value={password}
        onChangeText={setPassword}
      />

      {/* Sign-Up Button */}
      <TouchableOpacity style={styles.button} onPress={onHandleSignUp}>
        <Text style={styles.buttonText}>Sign Up</Text>
      </TouchableOpacity>

      {/* Google Sign-In Button */}
      <TouchableOpacity
        style={[styles.button, styles.googleButton]}
        onPress={handleGoogleSignIn}
      >
        <Text style={styles.buttonText}>Sign Up with Google</Text>
      </TouchableOpacity>

      {/* Facebook Sign-In Button */}
      <TouchableOpacity
        style={[styles.button, styles.facebookButton]}
        onPress={handleFacebookSignIn}
      >
        <Text style={styles.buttonText}>Sign Up with Facebook</Text>
      </TouchableOpacity>

      {/*  Navigate to Login Screen */}
      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.loginText}>Already have an account? Log in</Text>
      </TouchableOpacity>
    </View>
  );
}

// Styles for Sign-Up Screen
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
