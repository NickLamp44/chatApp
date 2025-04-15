import React, { useEffect, useState } from "react";
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

export default function RoomSelection({ navigation, user }) {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [passwordInput, setPasswordInput] = useState("");

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

  const handleRoomPress = (room) => {
    if (room.isPrivate) {
      setSelectedRoom(room);
      setShowPasswordModal(true);
    } else {
      joinRoom(room);
    }
  };

  const joinRoom = async (room, password = null) => {
    try {
      await joinChatRoom(user.userID, room.chatRoom_ID, password);
      navigation.navigate("Chat", {
        chatRoom_ID: room.chatRoom_ID,
        user,
      });
    } catch (error) {
      Alert.alert("Access Denied", error.message);
    }
  };

  const handlePasswordSubmit = () => {
    if (!passwordInput.trim()) {
      Alert.alert("Please enter the room password.");
      return;
    }

    joinRoom(selectedRoom, passwordInput);
    setPasswordInput("");
    setShowPasswordModal(false);
  };

  if (loading) {
    return <ActivityIndicator size="large" color="#444" />;
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
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.roomCard}
            onPress={() => handleRoomPress(item)}
          >
            <Text style={styles.roomName}>{item.chatRoomName}</Text>
            <Text style={styles.roomInfo}>
              {item.isPrivate ? "Private" : "Public"} |{" "}
              {item.members?.length || 0} Users
            </Text>
          </TouchableOpacity>
        )}
      />

      <TouchableOpacity
        style={styles.createButton}
        onPress={() => navigation.navigate("CreateRoom")}
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

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 20, fontWeight: "600", marginBottom: 10 },
  roomCard: {
    backgroundColor: "#eee",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  roomName: { fontSize: 18, fontWeight: "500" },
  roomInfo: { fontSize: 14, color: "#666" },
  createButton: {
    backgroundColor: "#444daf",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: { color: "#fff", fontWeight: "600" },
  emptyContainer: { padding: 20, alignItems: "center" },
  emptyText: { fontSize: 16, color: "#666" },

  modalContainer: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modalContent: {
    margin: 20,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
  },
  modalTitle: { fontSize: 18, fontWeight: "600", marginBottom: 10 },
  modalInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  modalButton: {
    backgroundColor: "#444daf",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  modalButtonText: { color: "#fff", fontWeight: "600" },
  cancelButton: {
    backgroundColor: "#aaa",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
});
