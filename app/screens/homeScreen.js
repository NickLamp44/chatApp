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
  ScrollView,
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
  const [tempColor, setTempColor] = useState("#090C08");

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

  const onColorChange = ({ hex }) => {
    setTempColor(hex);
  };

  const confirmColorSelection = () => {
    setBackgroundColor(tempColor);
    setShowColorPicker(false);
  };

  const openColorPicker = () => {
    setTempColor(backgroundColor);
    setShowColorPicker(true);
  };

  const colors = ["#090C08", "#474056", "#8A95A5", "#B9C6AE"];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <NavMenu />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.centeredContainer}>
          <Text style={styles.title}>Welcome to Circle Up!</Text>

          <View style={styles.cardContainer}>
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
                onPress={openColorPicker}
              >
                <Text style={styles.customColorButtonText}>More Colors</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.button} onPress={proceedToChat}>
                <Text style={styles.buttonText}>Start Chatting</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      <Modal
        animationType="slide"
        transparent={true}
        visible={showColorPicker}
        onRequestClose={() => setShowColorPicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowColorPicker(false)}
        >
          <TouchableOpacity
            style={styles.colorPickerContainer}
            activeOpacity={1}
            onPress={() => {}}
          >
            <Text style={styles.colorPickerTitle}>Choose Custom Color</Text>

            <ColorPicker
              value={tempColor}
              onChange={onColorChange}
              style={styles.colorPicker}
            >
              <Panel1 />
              <HueSlider />
              <OpacitySlider />
              <Preview />
              <Swatches />
            </ColorPicker>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.selectButton}
                onPress={confirmColorSelection}
              >
                <Text style={styles.selectButtonText}>Select Color</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowColorPicker(false)}
              >
                <Text style={styles.closeButtonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ebebeb",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  centeredContainer: {
    width: "100%",
    maxWidth: 600,
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#3a58c7",
    marginBottom: 24,
    textAlign: "center",
  },
  cardContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 24,
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  inputContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 20,
  },
  textInput: {
    width: "100%",
    padding: 16,
    borderWidth: 1.5,
    borderColor: "#d1d5db",
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 16,
    fontWeight: "400",
    color: "#999",
    backgroundColor: "#f9fafb",
  },
  colorText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#4b5563",
    marginBottom: 12,
    alignSelf: "flex-start",
  },
  colorContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    width: "100%",
    marginBottom: 20,
    gap: 12,
  },
  colorOption: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: "#e5e7eb",
  },
  selectedColor: {
    borderWidth: 4,
    borderColor: "#3a58c7",
  },
  button: {
    backgroundColor: "#3a58c7",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    width: "75%",
    marginTop: "10%",
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 26,
    fontWeight: "600",
  },
  customColorButton: {
    backgroundColor: "#606060",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    width: "50%",
    marginBottom: 12,
  },
  customColorButtonText: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  colorPickerContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 24,
    width: "90%",
    maxWidth: 420,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  colorPickerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1f2937",
    marginBottom: 20,
  },
  colorPicker: {
    width: "100%",
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: "row",
    width: "100%",
    gap: 12,
  },
  selectButton: {
    backgroundColor: "#919297",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    flex: 1,
  },
  selectButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  closeButton: {
    backgroundColor: "#6b7280",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    flex: 1,
  },
  closeButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default HomeScreen;
