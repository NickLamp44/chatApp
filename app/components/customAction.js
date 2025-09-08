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
    console.log("[v0] pickImage called");

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

    console.log("[v0] Launching image library picker");

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
      allowsEditing: true,
    });

    console.log("[v0] Image picker result:", result);

    if (!result.canceled && result.assets?.[0]) {
      console.log(
        "[v0] Image selected, calling uploadAndSendImage with URI:",
        result.assets[0].uri
      );
      await uploadAndSendImage(result.assets[0].uri);
    } else {
      console.log("[v0] Image selection canceled or no assets");
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
    console.log("[v0] getLocation called");

    if (Platform.OS === "web") {
      console.log("[v0] Using web geolocation API");

      if (!navigator.geolocation) {
        console.log("[v0] Geolocation not supported by browser");
        Alert.alert("Error", "Geolocation is not supported by this browser.");
        return;
      }

      try {
        console.log("[v0] Requesting location from browser...");
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000,
          });
        });

        console.log("[v0] Web location received:", position);

        const locationMessage = {
          _id: Math.random().toString(36).substring(7) + Date.now(),
          text: "📍 Location shared",
          user: { _id: user._id, name: user.name || "User" },
          location: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
          createdAt: new Date(),
        };

        console.log(
          "[v0] Calling onSend with web location message:",
          locationMessage
        );
        onSend([locationMessage]);
        console.log("[v0] Web location message sent successfully");
        return;
      } catch (error) {
        console.error("[v0] Web geolocation error:", error);
        let errorMessage = "Failed to get location: ";
        if (error.code === 1) {
          errorMessage += "Permission denied";
        } else if (error.code === 2) {
          errorMessage += "Position unavailable";
        } else if (error.code === 3) {
          errorMessage += "Timeout";
        } else {
          errorMessage += error.message;
        }
        Alert.alert("Location Error", errorMessage);
        return;
      }
    }

    if (!Location) {
      console.log("[v0] Location module not available");
      Alert.alert("Error", "Location not available.");
      return;
    }

    console.log("[v0] Requesting location permissions...");
    if (
      !(await requestPermission(
        Location.requestForegroundPermissionsAsync,
        "Location access is needed."
      ))
    ) {
      console.log("[v0] Location permission denied");
      return;
    }

    console.log(
      "[v0] Location permission granted, getting current position..."
    );

    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      console.log("[v0] Location received:", location);

      if (location) {
        const locationMessage = {
          _id: Math.random().toString(36).substring(7) + Date.now(),
          text: "📍 Location shared",
          user: { _id: user._id, name: user.name || "User" },
          location: {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          },
          createdAt: new Date(),
        };

        console.log(
          "[v0] Calling onSend with location message:",
          locationMessage
        );
        onSend([locationMessage]);
        console.log("[v0] Location message sent successfully");
      } else {
        console.log("[v0] No location data received");
      }
    } catch (error) {
      console.error("[v0] Location error:", error);
      Alert.alert("Location Error", `Failed to get location: ${error.message}`);
    }
  };

  const uploadAndSendImage = async (imageURI) => {
    console.log("[v0] uploadAndSendImage called with URI:", imageURI);

    if (!storage) {
      console.log("[v0] Storage not configured");
      Alert.alert("Error", "Storage not configured.");
      return;
    }

    try {
      console.log("[v0] Starting fetch of image URI");
      const response = await fetch(imageURI);

      if (!response.ok) {
        throw new Error(
          `Failed to fetch image: ${response.status} ${response.statusText}`
        );
      }

      const blob = await response.blob();
      console.log(
        "[v0] Image blob created, size:",
        blob.size,
        "type:",
        blob.type
      );

      if (blob.size === 0) {
        throw new Error("Image blob is empty");
      }

      if (blob.size > 25 * 1024 * 1024) {
        // 25MB limit (Firebase default)
        throw new Error("Image is too large (max 25MB)");
      }

      const imageName = `${user._id || "unknown"}-${Date.now()}.jpg`;
      const storageRef = ref(storage, `images/${imageName}`);
      console.log("[v0] Uploading to Firebase with name:", imageName);
      console.log("[v0] Storage ref path:", storageRef.fullPath);

      console.log("[v0] Starting Firebase upload...");

      // Create a promise that rejects after 60 seconds
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(
          () => reject(new Error("Firebase upload timeout after 60 seconds")),
          60000
        );
      });

      // Race between upload and timeout
      const uploadResult = await Promise.race([
        uploadBytes(storageRef, blob),
        timeoutPromise,
      ]);

      console.log("[v0] Upload successful, result:", uploadResult);
      console.log("[v0] Getting download URL...");

      const downloadURL = await getDownloadURL(storageRef);
      console.log("[v0] Download URL received:", downloadURL);

      const messageObject = {
        _id: Math.random().toString(36).substring(7) + Date.now(),
        text: "📷 Image",
        user: {
          _id: user._id || "unknown",
          name: user.name || "User",
        },
        image: downloadURL,
        createdAt: new Date(),
      };

      console.log("[v0] Calling onSend with message object:", messageObject);
      onSend([messageObject]);
      console.log("[v0] onSend called successfully");
    } catch (error) {
      console.error("[v0] Upload failed with error:", error);
      console.error("[v0] Error name:", error.name);
      console.error("[v0] Error message:", error.message);
      console.error("[v0] Error stack:", error.stack);

      console.log("[v0] Checking Firebase auth state...");
      import("../services/firebase").then(({ auth }) => {
        console.log(
          "[v0] Current user:",
          auth.currentUser ? "authenticated" : "not authenticated"
        );
        if (auth.currentUser) {
          console.log("[v0] User ID:", auth.currentUser.uid);
        }
      });

      let errorMessage = "Image upload failed. ";
      if (error.code === "storage/unauthorized") {
        errorMessage += "Permission denied. Check Firebase storage rules.";
      } else if (error.code === "storage/canceled") {
        errorMessage += "Upload was canceled.";
      } else if (error.code === "storage/unknown") {
        errorMessage += "Unknown error occurred. Please try again.";
      } else if (error.message.includes("timeout")) {
        errorMessage +=
          "Upload timed out. Check your connection and Firebase configuration.";
      } else if (
        error.message.includes("network") ||
        error.message.includes("fetch")
      ) {
        errorMessage += "Network error. Check your connection.";
      } else {
        errorMessage += error.message || "Please try again.";
      }

      Alert.alert("Upload Error", errorMessage);
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
