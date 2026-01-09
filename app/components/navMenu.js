"use client";
import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { logoutUser } from "../services/firebaseAuth";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function NavMenu() {
  const navigation = useNavigation();
  const [userID, setUserID] = useState(null);
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const saved = await AsyncStorage.getItem("user");
      if (saved) {
        const userData = JSON.parse(saved);
        setUserID(userData.userID);
        setUserName(userData.name || "User");
      }
    } catch (error) {
      console.error("Failed to load user data:", error);
    }
  };

  const handleProfile = () => {
    navigation.navigate("Profile", {
      userID: userID,
      name: userName,
    });
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      await AsyncStorage.clear();
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    } catch (error) {
      Alert.alert("Logout Error", error.message);
    }
  };

  return (
    <View style={styles.menuContainer}>
      <View style={styles.leftSection}>
        <Text style={styles.appTitle}>CircleUp</Text>
      </View>

      <View style={styles.rightSection}>
        <TouchableOpacity style={styles.profileButton} onPress={handleProfile}>
          <Text style={styles.profileText}>👤 Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>🚪 Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  menuContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#3a58c7",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  leftSection: {
    flex: 1,
    justifyContent: "flex-start",
  },
  rightSection: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "flex-end",
  },
  appTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#ffffff",
  },
  logoutButton: {
    backgroundColor: "#606060",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  logoutText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  profileButton: {
    backgroundColor: "#ffffff",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  profileText: {
    color: "#3a58c7",
    fontSize: 14,
    fontWeight: "600",
  },
});
