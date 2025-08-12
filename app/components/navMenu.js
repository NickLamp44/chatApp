"use client";
import { View, Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { logoutUser } from "../services/firebaseAuth";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function NavMenu() {
  const navigation = useNavigation();

  const handleLogout = async () => {
    try {
      await logoutUser(); // Call Firebase logout
      await AsyncStorage.clear(); // Clear stored user data
      navigation.reset({
        index: 0,
        routes: [{ name: "Login" }],
      }); // Reset navigation stack to login screen
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
    backgroundColor: "#f8f9fa",
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
    justifyContent: "flex-end",
  },
  appTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#2c3e50",
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
});
