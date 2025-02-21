// signup component and functions which will then direct the user to the homeScreen.js

import React, { useState } from "react";
import { StyleSheet, Text, View, Button, TextInput, Alert } from "react-native";
import { registerUser } from "../services/firebaseAuth";

export default function SignUp({ navigation }) {
  const [email, setEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [password, setPassword] = useState("");

  const onHandleSignUp = async () => {
    if (!email || !password || !userName) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }
    try {
      await registerUser(userName, email, password);
      Alert.alert("Success!", "Account created!");
      navigation.replace("Login");
    } catch (error) {
      Alert.alert("Signup Failed", error.message);
    }
  };
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create new account</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter email"
        autoCapitalize="none"
        keyboardType="email-address"
        textContentType="emailAddress"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter Username"
        autoCapitalize="none"
        textContentType="username"
        value={userName}
        onChangeText={setUserName}
      />
      <TextInput
        style={styles.input}
        placeholder="Enter password"
        autoCapitalize="none"
        secureTextEntry={true}
        textContentType="password"
        value={password}
        onChangeText={setPassword}
      />
      <Button onPress={onHandleSignUp} color="#6391b7" title="Signup" />
      <Button
        onPress={() => navigation.navigate("Login")}
        title="Go to Login"
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
