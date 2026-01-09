"use client";

import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Switch,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { createChatRoom } from "../services/chatRoomService";
import { v4 as uuidv4 } from "uuid";

export default function CreateRoomScreen() {
  const [roomName, setRoomName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [roomPassword, setRoomPassword] = useState("");

  const navigation = useNavigation();
  const route = useRoute();
  const { userID, name, email, profilePic, isGuest } = route.params || {};

  const handleCreateRoom = async () => {
    if (!roomName.trim()) {
      Alert.alert("Room name required!");
      return;
    }

    if (isPrivate && roomPassword.length < 4) {
      Alert.alert("Password must be at least 4 characters.");
      return;
    }

    const safeName = roomName.trim();
    const roomID = uuidv4();

    try {
      await createChatRoom(roomID, safeName, isPrivate, roomPassword || null);
      Alert.alert("Room Created!");

      navigation.replace("Chat", {
        chatRoom_ID: roomID,
        userID,
        name,
        email,
        profilePic,
        isGuest: !!isGuest,
      });
    } catch (error) {
      console.error("❌ Error creating room:", error);
      Alert.alert("Failed to create room.");
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Create New Room</Text>

          <TextInput
            placeholder="Enter Room Name"
            value={roomName}
            onChangeText={setRoomName}
            style={styles.input}
          />

          <View style={styles.privacyToggle}>
            <Text style={styles.toggleText}>
              {isPrivate ? "Private Room" : "Public Room"}
            </Text>
            <Switch value={isPrivate} onValueChange={setIsPrivate} />
          </View>

          {isPrivate && (
            <TextInput
              placeholder="Set Room Password"
              value={roomPassword}
              onChangeText={setRoomPassword}
              style={styles.input}
              secureTextEntry
            />
          )}

          <TouchableOpacity style={styles.button} onPress={handleCreateRoom}>
            <Text style={styles.buttonText}>Create Room</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: "#f5f5f5",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 480,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 32,
    textAlign: "center",
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    fontSize: 16,
    color: "#999",
    backgroundColor: "#fafafa",
  },
  privacyToggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    paddingVertical: 8,
  },
  toggleText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  button: {
    backgroundColor: "#444daf",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
