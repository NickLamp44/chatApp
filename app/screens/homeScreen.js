"use client";

import { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../services/firebase";
import ColorPicker, {
  Panel1,
  Swatches,
  Preview,
  OpacitySlider,
  HueSlider,
} from "reanimated-color-picker";

import RoomSelection from "../components/roomSelector";
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
  const [showColorPicker, setShowColorPicker] = useState(false);

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
          setEmail(parsed.email || "");
          setProfilePic(parsed.profilePic || "");
          setBackgroundColor(parsed.backgroundColor || "#090C08");
          setIsGuest(parsed.isGuest || false);
        }
      }
    };

    loadUser();
  }, [route.params]);

  useEffect(() => {
    if (isGuest) return;

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userData = {
          userID: user.uid,
          name: user.displayName || "User",
          email: user.email,
          profilePic: user.photoURL,
          backgroundColor: "#090C08",
          isGuest: false,
        };
        await AsyncStorage.setItem("user", JSON.stringify(userData));
        setUserID(user.uid);
        setName(user.displayName || "User");
        setEmail(user.email);
        setProfilePic(user.photoURL);
        setIsGuest(false);
      }
    });
    return unsubscribe;
  }, [isGuest]);

  const handleRoomSelect = (roomID) => {
    console.log("🟡 onRoomSelect triggered with:", roomID);
    setSelectedRoomID(roomID);
  };

  const proceedToChat = async () => {
    if (!selectedRoomID) {
      Alert.alert("⚠️ Select a Room", "Please select a chat room first.");
      return;
    }

    if (isGuest && !name.trim()) {
      Alert.alert("⚠️ Name required", "Please enter a display name.");
      return;
    }

    const userData = {
      userID,
      name,
      email,
      profilePic,
      backgroundColor,
      isGuest,
    };

    await AsyncStorage.setItem("user", JSON.stringify(userData));

    navigation.replace("Chat", {
      chatRoom_ID: selectedRoomID,
      user: userData,
    });
  };

  const onSelectColor = ({ hex }) => {
    setBackgroundColor(hex);
    setShowColorPicker(false);
  };

  const colors = ["#090C08", "#474056", "#8A95A5", "#B9C6AE"];

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
              multiline
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

          <TouchableOpacity
            style={styles.customColorButton}
            onPress={() => setShowColorPicker(true)}
          >
            <Text style={styles.customColorButtonText}>More Colors</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.button} onPress={proceedToChat}>
            <Text style={styles.buttonText}>Start Chatting</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showColorPicker}
        onRequestClose={() => setShowColorPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.colorPickerContainer}>
            <Text style={styles.colorPickerTitle}>Choose Custom Color</Text>

            <ColorPicker
              value={backgroundColor}
              onComplete={onSelectColor}
              style={styles.colorPicker}
            >
              <Panel1 />
              <HueSlider />
              <OpacitySlider />
              <Preview />
              <Swatches />
            </ColorPicker>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowColorPicker(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
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
  customColorButton: {
    backgroundColor: "#007AFF",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
    marginBottom: 15,
  },
  customColorButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  colorPickerContainer: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    width: "85%",
    maxWidth: 400,
    alignItems: "center",
  },
  colorPickerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 20,
  },
  colorPicker: {
    width: "100%",
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: "#757083",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
  },
  closeButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
});

export default HomeScreen;
