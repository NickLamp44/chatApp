"use client";

import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  TextInput,
  Modal,
  Alert,
  StyleSheet,
} from "react-native";
import { getAllChatRooms, joinChatRoom } from "../services/chatRoomService";

export default function RoomSelection({ navigation, user, onRoomSelect }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [selectedRoomID, setSelectedRoomID] = useState(null);
  const [passwordInput, setPasswordInput] = useState("");
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const allRooms = await getAllChatRooms();
        setRooms(allRooms);
      } catch (error) {
        console.error("❌ Error loading chat rooms:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const joinRoom = async (room, password = null) => {
    try {
      await joinChatRoom(user.userID, room.chatRoom_ID, password);
      setSelectedRoomID(room.chatRoom_ID);

      console.log("✅ Joined Room:", room.chatRoom_ID);
      onRoomSelect?.(room.chatRoom_ID);

      return true;
    } catch (error) {
      console.error("❌ Failed to join room:", error.message);
      Alert.alert("Access Denied", error.message);
      return false;
    }
  };

  const handleRoomPress = (room) => {
    if (room.isPrivate) {
      setSelectedRoom(room);
      setShowPasswordModal(true);
    } else {
      joinRoom(room);
    }
  };

  const handlePasswordSubmit = async () => {
    if (!passwordInput.trim()) {
      Alert.alert("⚠️ Required", "Please enter the room password.");
      return;
    }

    const success = await joinRoom(selectedRoom, passwordInput);
    if (success) {
      setPasswordInput("");
      setShowPasswordModal(false);
    }
  };

  const handleCreateRoomPress = () => {
    navigation.navigate("CreateRoomScreen", {
      userID: user.userID,
      name: user.name,
      email: user.email,
      profilePic: user.profilePic,
      isGuest: user.isGuest,
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#3a58c7" />
      </View>
    );
  }

  if (rooms.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No Chat Rooms Available Yet</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Available Chat Rooms</Text>

      <FlatList
        data={rooms}
        keyExtractor={(item) => item.id}
        style={styles.roomList}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[
              styles.roomCard,
              selectedRoomID === item.chatRoom_ID && styles.selectedRoomCard,
            ]}
            onPress={() => handleRoomPress(item)}
          >
            <Text style={styles.roomName}>{item.chatRoomName}</Text>
            <Text style={styles.roomInfo}>
              {item.isPrivate ? "🔒 Private" : "🌐 Public"} •{" "}
              {item.members?.length || 0} Users
            </Text>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity
        style={styles.createButton}
        onPress={handleCreateRoomPress}
      >
        <Text style={styles.buttonText}>+ Create New Room</Text>
      </TouchableOpacity>

      <Modal visible={showPasswordModal} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter Room Password</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Room Password"
              placeholderTextColor="#9ca3af"
              secureTextEntry
              value={passwordInput}
              onChangeText={setPasswordInput}
            />

            <TouchableOpacity
              style={styles.modalButton}
              onPress={handlePasswordSubmit}
            >
              <Text style={styles.modalButtonText}>Join Room</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => {
                setShowPasswordModal(false);
                setPasswordInput("");
              }}
            >
              <Text style={styles.modalButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// STYLES
const styles = StyleSheet.create({
  container: {
    width: "100%",
  },
  loadingContainer: {
    padding: 40,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
    color: "#1f2937",
  },
  roomList: {
    maxHeight: 280,
    marginBottom: 16,
  },
  roomCard: {
    backgroundColor: "#f9fafb",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: "#e5e7eb",
  },
  selectedRoomCard: {
    borderColor: "#3a58c7",
    backgroundColor: "#eff6ff",
  },
  roomName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 4,
  },
  roomInfo: {
    fontSize: 14,
    color: "#6b7280",
  },
  createButton: {
    alignSelf: "center",
    width: "50%",
    backgroundColor: "#3a58c7",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 15,
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 20,
  },
  modalContent: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#ffffff",
    padding: 24,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
    color: "#1f2937",
    textAlign: "center",
  },
  modalInput: {
    borderWidth: 1.5,
    borderColor: "#d1d5db",
    padding: 14,
    borderRadius: 10,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: "#f9fafb",
    color: "#1f2937",
  },
  modalButton: {
    backgroundColor: "#3a58c7",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  modalButtonText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: "#6b7280",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
  },
});
