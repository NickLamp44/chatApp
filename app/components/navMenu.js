// Menu for navigating the chat app ( Home , *?Chats? temp if i want to track what chats a user has joined and sent messages in* , Profile, Log Out)
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebaseAuth"; // Ensure correct import

export default function NavMenu() {
  const navigation = useNavigation();

  // Function to log out the user
  const handleLogout = async () => {
    try {
      await signOut(auth);
      Alert.alert("Logged Out", "You have been logged out successfully.");
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }], // Reset stack & go to Login
      });
    } catch (error) {
      Alert.alert("Logout Failed", error.message);
    }
  };

  return (
    <View style={styles.menuContainer}>
      <TouchableOpacity onPress={() => navigation.navigate("Home")}>
        <Text style={styles.menuItem}>🏠 Home</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Profile")}>
        <Text style={styles.menuItem}>👤 Profile</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Chat")}>
        <Text style={styles.menuItem}>💬 Chat</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={handleLogout}>
        <Text style={[styles.menuItem, styles.logoutText]}>🚪 Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  menuContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10,
    backgroundColor: "#eee",
  },
  menuItem: {
    fontSize: 16,
    fontWeight: "bold",
  },
  logoutText: {
    color: "red",
  },
});
