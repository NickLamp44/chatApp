// login component (Email or Username & password ) Use firebase Auth to use google/apple/facebook to authenticate which will then direct the user to the homeScreen.js

import React, { useState } from "react";
import { StyleSheet, Text, View, Button, TextInput } from "react-native";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../config/firebase";

export default function Login({ navigation }) {
  const [email, setEmail] = useState("");
  const [userName, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const onHandleLogin = () => {
    if (email !== "&&password!==") {
      signInWithEmailAndPassword(auth, email, password)
        .then(() => console.log("Login Successful"))
        .catch((err) => console.log("Login Err: ${err"));
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome back!</Text>
      {/* will accept either email or username for login */}
      <TextInput
        style={styles.input}
        placeholder="Enter Email or Username "
        autoCapitalize="none"
        keyboardType="email-address"
        textContentType="emailAddress"
        autoFocus={true}
        value={email}
        onChangeText={(text) => setEmail(text)}
        // Need to implement funciton to detect if a user has submitted a username or email
      />
      <TextInput
        style={styles.input}
        placeholder="Enter password"
        autoCapitalize="none"
        autoCorrect={false}
        secureTextEntry={true}
        textContentType="password"
        value={password}
        onChangeText={(text) => setPassword(text)}
      />

      {/* Placeholder for component allowing Google/Apple/Facebook Auth using firebase */}
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
