import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import RoomSelection from "../components/roomSelector";

const HomeScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();

  const { userID, isGuest, name: initialName } = route.params || {};

  const [name, setName] = useState(initialName || "");
  const [backgroundColor, setBackgroundColor] = useState("#090C08");

  const colors = ["#090C08", "#474056", "#8A95A5", "#B9C6AE"];

  const proceedToChat = async () => {
    if (isGuest && !name.trim()) {
      Alert.alert("⚠️ Name required", "Please enter a display name.");
      return;
    }

    await AsyncStorage.setItem(
      "user",
      JSON.stringify({ userID, name, backgroundColor })
    );

    navigation.replace("Chat", {
      userID,
      name,
      backgroundColor,
      isGuest: !!isGuest,
    });
  };

  const handleKeyPress = (e) => {
    if (Platform.OS === "web" && e.nativeEvent.key === "Enter") {
      proceedToChat();
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Welcome to Circle Up!</Text>
        <RoomSelection
          navigation={navigation}
          user={{ userID, name, email, profilePic }}
        />
        <View style={styles.inputContainer}>
          {isGuest && (
            <>
              <TextInput
                style={styles.textInput}
                value={name}
                onChangeText={setName}
                placeholder="Enter Your Name"
                placeholderTextColor="#757083"
                onKeyPress={handleKeyPress}
                multiline={true}
              />
            </>
          )}

          <Text style={styles.colorText}>Choose Background Color:</Text>

          <View style={styles.colorContainer}>
            {colors.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                  backgroundColor === color && styles.selectedColor,
                ]}
                onPress={() => setBackgroundColor(color)}
              />
            ))}
          </View>

          <TouchableOpacity style={styles.button} onPress={proceedToChat}>
            <Text style={styles.buttonText}>Start Chatting</Text>
          </TouchableOpacity>

          {/* DEV ROOM */}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#FF6347" }]}
            onPress={seedInitialRooms}
          >
            <Text style={styles.buttonText}>Seed Initial Rooms</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  // unchanged styles...
  container: { flex: 1 },
  background: { flex: 1, justifyContent: "center" },
  contentContainer: {
    flex: 1,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: "20%",
  },
  title: {
    fontSize: 45,
    fontWeight: "600",
    color: "#5d0707",
    marginBottom: 40,
  },
  inputContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "88%",
    alignItems: "center",
  },
  textInput: {
    width: "100%",
    padding: 15,
    borderWidth: 1,
    borderColor: "#757083",
    marginBottom: 20,
    fontSize: 16,
    fontWeight: "300",
    color: "#757083",
    opacity: 0.8,
  },
  colorText: {
    fontSize: 16,
    fontWeight: "300",
    color: "#757083",
    marginBottom: 10,
  },
  colorContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "80%",
    marginBottom: 20,
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  selectedColor: {
    borderWidth: 3,
    borderColor: "#000",
  },
  button: {
    backgroundColor: "#757083",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    width: "100%",
    marginVertical: 5,
  },
  loginButton: {
    backgroundColor: "#4CAF50",
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default HomeScreen;
