import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Alert,
  TouchableOpacity,
  Button,
} from "react-native";
import {
  loginUserWithEmail,
  loginUserWithUsername,
  signInWithGoogle,
  signInWithFacebook,
} from "../services/firebaseAuth";
import { getAuth, signInAnonymously } from "firebase/auth";
import { AntDesign, FontAwesome } from "@expo/vector-icons";

export default function Login({ navigation }) {
  const [input, setInput] = useState("");
  const [password, setPassword] = useState("");

  //  Email/Username Login
  const onHandleLogin = async () => {
    if (!input || !password) {
      Alert.alert(
        "❌ Error",
        "Please enter your Username or Email and Password."
      );
      return;
    }

    try {
      const isEmail = input.includes("@");
      if (isEmail) {
        await loginUserWithEmail(input, password);
      } else {
        await loginUserWithUsername(input, password);
      }
      console.log("✅ Login Successful");
      navigation.navigate("HomeScreen");
    } catch (error) {
      Alert.alert("❌ Login Failed", error.message);
    }
  };

  // Google Sign-in
  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      console.log("✅ Google Sign-in Successful");
      navigation.navigate("HomeScreen");
    } catch (error) {
      Alert.alert("❌ Google Login Failed", error.message);
    }
  };

  // Facebook Sign-in
  const handleFacebookLogin = async () => {
    try {
      await signInWithFacebook();
      console.log("✅ Facebook Sign-in Successful");
      navigation.navigate("HomeScreen");
    } catch (error) {
      Alert.alert("❌ Facebook Login Failed", error.message);
    }
  };

  // Anonymous Login
  const handleAnonymousLogin = async () => {
    try {
      const auth = getAuth();
      const result = await signInAnonymously(auth);
      console.log("✅ Signed in anonymously");
      navigation.navigate("HomeScreen", { userID: result.user.uid });
    } catch (error) {
      Alert.alert("❌ Anonymous Login Failed", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back!</Text>

      {/* Email/Username Input */}
      <TextInput
        style={styles.input}
        placeholder="Enter Email or Username"
        autoCapitalize="none"
        value={input}
        onChangeText={setInput}
      />

      {/* Password Input */}
      <TextInput
        style={styles.input}
        placeholder="Enter Password"
        secureTextEntry={true}
        value={password}
        onChangeText={setPassword}
      />

      {/* Login Button */}
      <Button onPress={onHandleLogin} color="#444daf" title="Login" />

      <Text style={styles.orText}>OR</Text>

      {/* Google Sign-in Button */}
      <TouchableOpacity style={styles.googleButton} onPress={handleGoogleLogin}>
        <AntDesign name="google" size={24} color="white" />
        <Text style={styles.buttonText}>Sign in with Google</Text>
      </TouchableOpacity>

      {/* Facebook Sign-in Button */}
      <TouchableOpacity
        style={styles.facebookButton}
        onPress={handleFacebookLogin}
      >
        <FontAwesome name="facebook" size={24} color="white" />
        <Text style={styles.buttonText}>Sign in with Facebook</Text>
      </TouchableOpacity>

      {/* Anonymous Login */}
      <TouchableOpacity style={styles.button} onPress={handleAnonymousLogin}>
        <Text style={styles.buttonText}>Continue as Guest</Text>
      </TouchableOpacity>

      {/* Sign Up Navigation */}
      <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
        <Text style={styles.signupText}>Don't have an account? Sign up</Text>
      </TouchableOpacity>
    </View>
  );
}

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
    width: "100%",
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
  button: {
    backgroundColor: "#757083",
    padding: 12,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    marginBottom: 10,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#DB4437",
    padding: 12,
    borderRadius: 8,
    width: "100%",
    justifyContent: "center",
    marginBottom: 10,
  },
  facebookButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#3b5998",
    padding: 12,
    borderRadius: 8,
    width: "100%",
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
