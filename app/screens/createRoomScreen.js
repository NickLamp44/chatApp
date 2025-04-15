import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Switch,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { createChatRoom } from "../services/chatRoomService";
import { v4 as uuidv4 } from "uuid";

export default function CreateRoomScreen() {
  const [roomName, setRoomName] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [roomPassword, setRoomPassword] = useState("");

  const navigation = useNavigation();

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
    const roomID = uuidv4(); // ← Auto-generated Unique ID

    try {
      await createChatRoom(roomID, safeName, isPrivate, roomPassword || null);
      Alert.alert("Room Created!");

      navigation.replace("Chat", {
        chatRoom_ID: roomID,
      });
    } catch (error) {
      console.error("❌ Error creating room:", error);
      Alert.alert("Failed to create room.");
    }
  };

  return (
    <View style={styles.container}>
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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: "center" },
  title: { fontSize: 26, fontWeight: "700", marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  privacyToggle: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },
  toggleText: { fontSize: 16 },
  button: {
    backgroundColor: "#444daf",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "600" },
});
