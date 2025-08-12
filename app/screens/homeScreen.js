import React, { useState, useEffect } from "react";
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
import { seedInitialRooms } from "../utils/seedInitalRooms";
import NavMenu from "../components/navMenu";

const HomeScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();

  const [userID, setUserID] = useState(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profilePic, setProfilePic] = useState("");
  const [isGuest, setIsGuest] = useState(false);
  const [backgroundColor, setBackgroundColor] = useState("#090C08");
  const [selectedRoomID, setSelectedRoomID] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      if (route.params) {
        const { userID, name, email, profilePic, isGuest } = route.params;
        setUserID(userID);
        setName(name);
        setEmail(email);
        setProfilePic(profilePic);
        setIsGuest(!!isGuest);
      } else {
        const user = await AsyncStorage.getItem("user");
        if (user) {
          const parsed = JSON.parse(user);
          setUserID(parsed.userID);
          setName(parsed.name);
          setBackgroundColor(parsed.backgroundColor || "#090C08");
          setIsGuest(false);
        }
      }
    };

    loadUser();
  }, [route.params]);

  const handleRoomSelect = (roomID) => {
    console.log("🟡 onRoomSelect triggered with:", roomID);
    setSelectedRoomID(roomID);
  };

  const colors = ["#090C08", "#474056", "#8A95A5", "#B9C6AE"];

  const proceedToChat = async () => {
    if (!selectedRoomID) {
      Alert.alert("⚠️ Select a Room", "Please select a chat room first.");
      return;
    }

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
      isGuest,
      chatRoom_ID: selectedRoomID,
      email,
      profilePic,
    });

    console.log("➡️ Proceeding to Chat with:", {
      selectedRoomID,
      userID,
      name,
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
      <NavMenu />
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Welcome to Circle Up!</Text>

        <RoomSelection
          navigation={navigation}
          user={{ userID, name, email, profilePic }}
          onRoomSelect={handleRoomSelect}
        />

        <View style={styles.inputContainer}>
          {isGuest && (
            <TextInput
              style={styles.textInput}
              value={name}
              onChangeText={setName}
              placeholder="Enter Your Name"
              placeholderTextColor="#757083"
              onKeyPress={handleKeyPress}
              multiline={true}
            />
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
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
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
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default HomeScreen;
