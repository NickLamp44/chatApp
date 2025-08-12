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

     
      navigation.navigate("HomeScreen", userData);
    } catch (error) {
      Alert.alert("❌ Google Login Failed", error.message);
    }
  };

  
   const handleGuestLogin = () => {
     
     const guestUserData = {
       userID: `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
       name: "", 
       isGuest: true,
     };

     console.log("✅ Guest Login", guestUserData);

     navigation.navigate("HomeScreen", guestUserData);
   };

  // ===== UI RENDER =====
  return (
    <View style={styles.container}>
     
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

     
      <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
        <AntDesign name="google" size={24} color="white" />
        <Text style={styles.buttonText}>Sign in with Google</Text>
      </TouchableOpacity>

      
      <TouchableOpacity style={styles.button} onPress={handleGuestLogin}>
        <Text style={styles.buttonText}>Continue as Guest</Text>
      </TouchableOpacity>

      
      <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
        <Text style={styles.signupText}>Don't have an account? Sign up</Text>
      </TouchableOpacity>
    </View>
  );
}

// ===== STYLES SECTION =====
const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 50,
    paddingHorizontal: 20,
    alignItems: "center",
  },

  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#444",
    paddingBottom: 24,
  },

  input: {
    width: "80%",
    backgroundColor: "#fff",
    marginBottom: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 8,
    padding: 12,
  },

  orText: {
    fontSize: 16,
    color: "#444",
    marginVertical: 15,
    fontWeight: "600",
  },

  loginButton: {
    backgroundColor: "#757083",
    padding: 12,
    borderRadius: 8,
    width: "80%",
    alignItems: "center",
    marginBottom: 10,
  },

  button: {
    backgroundColor: "#757083",
    padding: 12,
    borderRadius: 8,
    width: "80%",
    alignItems: "center",
    marginBottom: 10,
  },

  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DB4437",
    padding: 12,
    borderRadius: 8,
    width: "80%",
    justifyContent: "center",
    marginBottom: 10,
  },

  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 10,
  },

  signupText: {
    marginTop: 10,
    fontSize: 16,
    color: "#444",
  },
});
