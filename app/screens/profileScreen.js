"use client";
import { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { logoutUser } from "../services/firebaseAuth";
import { updateProfile } from "firebase/auth";
import { auth } from "../services/firebase";

export default function ProfileScreen({ route, navigation }) {
  const [user, setUser] = useState(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState("");

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const saved = await AsyncStorage.getItem("user");
      if (saved) {
        const userData = JSON.parse(saved);
        setUser(userData);
        setNewName(userData.name || "");
      } else {
        Alert.alert("Error", "No user data found");
        navigation.navigate("Login");
      }
    } catch (error) {
      console.error("Failed to load user data:", error);
      Alert.alert("Error", "Failed to load profile data");
    }
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

  const handleBackToHome = () => {
    navigation.navigate("HomeScreen");
  };

  const handleUpdateName = async () => {
    if (!newName.trim()) {
      Alert.alert("Error", "Name cannot be empty");
      return;
    }

    try {
      // Update Firebase profile if not a guest
      if (!user.isGuest && auth.currentUser) {
        await updateProfile(auth.currentUser, {
          displayName: newName,
        });
      }

      // Update AsyncStorage
      const updatedUser = { ...user, name: newName };
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      setIsEditingName(false);
      Alert.alert("Success", "Name updated successfully");
    } catch (error) {
      console.error("Failed to update name:", error);
      Alert.alert("Error", "Failed to update name");
    }
  };

  if (!user) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const getMemberSince = () => {
    if (user.isGuest && user.userID.startsWith("guest_")) {
      const timestamp = Number.parseInt(user.userID.split("_")[1]);
      const date = new Date(timestamp);
      return date.toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
      });
    }
    return "January 2024"; // Placeholder for Firebase users
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.card}>
          {/* Avatar Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user.name?.charAt(0).toUpperCase() || "?"}
              </Text>
            </View>
            <Text style={styles.userName}>{user.name || "Guest"}</Text>
            <Text style={styles.userID}>ID: {user.userID}</Text>
          </View>

          {/* Account Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account Information</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user.email || "N/A"}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Member Since</Text>
              <Text style={styles.infoValue}>{getMemberSince()}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Account Type</Text>
              <Text style={styles.infoValue}>
                {user.isGuest ? "Guest" : "Standard"}
              </Text>
            </View>
          </View>

          {/* Activity Stats */}
          {/* <View style={styles.section}>
            <Text style={styles.sectionTitle}>Activity</Text>
            <View style={styles.statsContainer}>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>--</Text>
                <Text style={styles.statLabel}>Rooms Joined</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>--</Text>
                <Text style={styles.statLabel}>Messages Sent</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statNumber}>--</Text>
                <Text style={styles.statLabel}>Rooms Created</Text>
              </View>
            </View>
            <Text style={styles.statsNote}>Activity stats coming soon</Text>
          </View> */}

          {/* Settings Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Settings</Text>
            <TouchableOpacity
              style={styles.settingItem}
              onPress={() => setIsEditingName(true)}
            >
              <Text style={styles.settingText}>Change Username</Text>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>
            {/* <View style={styles.divider} />
            <TouchableOpacity style={styles.settingItem}>
              <Text style={styles.settingText}>Notifications</Text>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.settingItem}>
              <Text style={styles.settingText}>Privacy</Text>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <TouchableOpacity style={styles.settingItem}>
              <Text style={styles.settingText}>Change Password</Text>
              <Text style={styles.settingArrow}>›</Text>
            </TouchableOpacity> */}
          </View>

          {/* Action Buttons */}
          <TouchableOpacity
            style={styles.homeButton}
            onPress={handleBackToHome}
          >
            <Text style={styles.homeButtonText}>Back to Home</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={styles.logoutButtonText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal
        visible={isEditingName}
        transparent
        animationType="slide"
        onRequestClose={() => setIsEditingName(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Change Username</Text>
            <TextInput
              style={styles.modalInput}
              value={newName}
              onChangeText={setNewName}
              placeholder="Enter new username"
              autoFocus
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={styles.modalCancelButton}
                onPress={() => setIsEditingName(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalSaveButton}
                onPress={handleUpdateName}
              >
                <Text style={styles.modalSaveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 24,
    width: "100%",
    maxWidth: 600,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarSection: {
    alignItems: "center",
    marginBottom: 32,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  avatarText: {
    fontSize: 40,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  userName: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  userID: {
    fontSize: 14,
    color: "#666",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  infoLabel: {
    fontSize: 16,
    color: "#666",
  },
  infoValue: {
    fontSize: 16,
    color: "#333",
    fontWeight: "500",
  },
  divider: {
    height: 1,
    backgroundColor: "#E5E5E5",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    padding: 16,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#007AFF",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
  },
  settingText: {
    fontSize: 16,
    color: "#333",
  },
  settingArrow: {
    fontSize: 24,
    color: "#999",
  },
  homeButton: {
    backgroundColor: "#007AFF",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 12,
  },
  homeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  logoutButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FF3B30",
  },
  logoutButtonText: {
    color: "#FF3B30",
    fontSize: 16,
    fontWeight: "600",
  },
  statsNote: {
    fontSize: 12,
    color: "#999",
    textAlign: "center",
    marginTop: 8,
    fontStyle: "italic",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 24,
    width: "90%",
    maxWidth: 400,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#333",
    marginBottom: 16,
    textAlign: "center",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#E5E5E5",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalCancelButton: {
    flex: 1,
    backgroundColor: "#F8F9FA",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  modalCancelText: {
    color: "#666",
    fontSize: 16,
    fontWeight: "600",
  },
  modalSaveButton: {
    flex: 1,
    backgroundColor: "#007AFF",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  modalSaveText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
