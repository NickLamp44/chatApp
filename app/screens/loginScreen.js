// login component (Email or Username & password ) Use firebase Auth to use google/apple/facebook to authenticate which will then direct the user to the homeScreen.js
import React, { useState } from "react";
import { StyleSheet, Text, View, Button, TextInput, Alert } from "react-native";
import {
  loginUserWithEmail,
  loginUserWithUsername,
} from "../services/firebaseAuth";

export default function Login({ navigation }) {
  const [input, setInput] = useState("");
  const [password, setPassword] = useState("");

  const onHandleLogin = async () => {
    if (!input || !password) {
      Alert.alert("Error", "Please enter your Username or Email and Password.");
      return;
    }

    try {
      const isEmail = input.includes("@");
      if (isEmail) {
        await loginUserWithEmail(input, password);
      } else {
        await loginUserWithUsername(input, password);
      }
      console.log("Login Successful");
      navigation.navigate("Chat");
    } catch (error) {
      Alert.alert("Login Failed", error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome back!</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter Email or Username"
        autoCapitalize="none"
        value={input}
        onChangeText={setInput}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter password"
        secureTextEntry={true}
        value={password}
        onChangeText={setPassword}
      />
      <Button onPress={onHandleLogin} color="#444daf" title="Login" />
      <Button
        onPress={() => navigation.navigate("Signup")}
        title="Go to Signup"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 50,
    paddingHorizontal: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#444",
    alignSelf: "center",
    paddingBottom: 24,
  },
  input: {
    backgroundColor: "#fff",
    marginBottom: 20,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#333",
    borderRadius: 8,
    padding: 12,
  },
});
