import React, { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { getAuth, signInAnonymously } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const HomeScreen = () => {
  const [name, setName] = useState("");
  const [backgroundColor, setBackgroundColor] = useState("#090C08");
  const navigation = useNavigation();
  const auth = getAuth();

  const signInUser = async () => {
    if (!name.trim()) {
      Alert.alert("⚠️ Error", "Please enter a name before proceeding.");
      return;
    }

    try {
      const result = await signInAnonymously(auth);
      const userID = result.user.uid;

      // Save basic session info (optional)
      await AsyncStorage.setItem(
        "user",
        JSON.stringify({ userID, name, backgroundColor })
      );

      navigation.replace("Chat", {
        userID,
        name,
        backgroundColor,
      });

      Alert.alert("✅ Success", "Signed in as a guest!");
    } catch (error) {
      console.error("🔥 Error during anonymous sign-in:", error);
      Alert.alert("❌ Sign-in Failed", "Please try again later.");
    }
  };

  const handleKeyPress = (e) => {
    if (Platform.OS === "web" && e.nativeEvent.key === "Enter") {
      signInUser();
    }
  };

  const colors = ["#090C08", "#474056", "#8A95A5", "#B9C6AE"];

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.contentContainer}>
        <Text style={styles.title}>Welcome to ChatApp!</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={name}
            onChangeText={setName}
            placeholder="Enter Your Name"
            placeholderTextColor="#757083"
            onKeyPress={handleKeyPress}
            multiline={true}
            accessibilityLabel="Enter your name"
          />
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
                accessibilityLabel={`Select background color ${color}`}
              />
            ))}
          </View>

          <TouchableOpacity style={styles.button} onPress={signInUser}>
            <Text style={styles.buttonText}>Start Chatting</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.loginButton]}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={styles.buttonText}>Login with Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
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
