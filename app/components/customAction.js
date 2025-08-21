import {
  TouchableOpacity,
  Text,
  View,
  StyleSheet,
  Alert,
  Platform,
} from "react-native";
import { useActionSheet } from "@expo/react-native-action-sheet";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "../services/firebase"; 

let ImagePicker, Location;
if (Platform.OS !== "web") {
  try {
    ImagePicker = require("expo-image-picker");
    Location = require("expo-location");
  } catch (error) {
    console.warn("Native modules not available:", error);
  }
}

const CustomActions = ({ onSend, user }) => {
  const { showActionSheetWithOptions } = useActionSheet();

  const onActionPress = () => {
    const options = [
      "Choose From Library",
      "Take Picture",
      "Send Location",
      "Cancel",
    ];
    const cancelButtonIndex = options.length - 1;

    showActionSheetWithOptions(
      { options, cancelButtonIndex },
      async (buttonIndex) => {
        try {
          if (buttonIndex === 0) await pickImage();
          if (buttonIndex === 1) await takePhoto();
          if (buttonIndex === 2) await getLocation();
        } catch (error) {
          console.error("Action failed:", error);
          Alert.alert("Error", "Action failed. Please try again.");
        }
      }
    );
  };

  const requestPermission = async (permissionFunc, alertMessage) => {
    if (Platform.OS === "web") return true;

    try {
      const { granted } = await permissionFunc();
      if (!granted) {
        Alert.alert(alertMessage);
        return false;
      }
      return true;
    } catch (error) {
      console.error("Permission request failed:", error);
      Alert.alert("Permission Error", "Failed to request permission.");
      return false;
    }
  };

  
  const pickImageWeb = () =>
    new Promise((resolve) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = (event) => {
        const file = event.target.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = (e) => {
            resolve({
              canceled: false,
              assets: [{ uri: e.target.result }],
            });
          };
          reader.readAsDataURL(file);
        } else {
          resolve({ canceled: true });
        }
      };
      input.click();
    });

  const pickImage = async () => {
    if (Platform.OS === "web") {
      const result = await pickImageWeb();
      if (!result.canceled && result.assets?.[0]) {
        await uploadAndSendImage(result.assets[0].uri);
      }
      return;
    }

    if (!ImagePicker) {
      Alert.alert("Error", "Image picker not available.");
      return;
    }

    if (
      !(await requestPermission(
        ImagePicker.requestMediaLibraryPermissionsAsync,
        "Gallery access is needed."
      ))
    )
      return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets?.[0]) {
      await uploadAndSendImage(result.assets[0].uri);
    }
  };

  const takePhoto = async () => {
    if (!ImagePicker) {
      Alert.alert("Error", "Camera not available.");
      return;
    }

    if (
      !(await requestPermission(
        ImagePicker.requestCameraPermissionsAsync,
        "Camera access is needed."
      ))
    )
      return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsEditing: true,
    });

    if (!result.canceled && result.assets?.[0]) {
      await uploadAndSendImage(result.assets[0].uri);
    }
  };

  const getLocation = async () => {
    if (!Location) {
      Alert.alert("Error", "Location not available.");
      return;
    }

    if (
      !(await requestPermission(
        Location.requestForegroundPermissionsAsync,
        "Location access is needed."
      ))
    )
      return;

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    if (location) {
      onSend([
        {
          _id: `${Date.now()}-${user._id}`,
          user: { _id: user._id, name: user.name || "User" },
          location: {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          },
          createdAt: new Date(),
        },
      ]);
    }
  };

  const uploadAndSendImage = async (imageURI) => {
    if (!storage) {
      Alert.alert("Error", "Storage not configured.");
      return;
    }

    try {
      const response = await fetch(imageURI);
      const blob = await response.blob();

      const imageName = `${user._id || "unknown"}-${Date.now()}.jpg`;
      const storageRef = ref(storage, `images/${imageName}`);

      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);

      const messageObject = {
        _id: `${Date.now()}-${user._id || "unknown"}`,
        user: {
          _id: user._id || "unknown",
          name: user.name || "User",
        },
        image: downloadURL,
        createdAt: new Date(),
      };

      onSend([messageObject]);
    } catch (error) {
      console.error("Upload failed:", error);
      Alert.alert("Image upload failed.", error.message || "Please try again.");
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={onActionPress}>
      <View style={styles.wrapper}>
        <Text style={styles.iconText}>+</Text>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 30,
    height: 30,
    marginLeft: 10,
    marginBottom: 10,
  },
  wrapper: {
    borderRadius: 15,
    borderWidth: 2,
    borderColor: "#000",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default CustomActions;
