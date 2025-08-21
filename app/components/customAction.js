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

let ImagePicker, Location;
if (Platform.OS !== "web") {
  try {
    ImagePicker = require("expo-image-picker");
    Location = require("expo-location");
  } catch (error) {
    console.warn("Native modules not available:", error);
  }
}

const CustomActions = ({ onSend, storage, userID }) => {
  const { showActionSheetWithOptions } = useActionSheet();

  console.log("[v0] CustomActions initialized with storage:", !!storage);
  console.log("[v0] CustomActions userID:", userID);

  const onActionPress = () => {
    console.log("[v0] CustomActions button pressed");
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
          console.log("[v0] Action selected:", buttonIndex);
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
    if (Platform.OS === "web") {
      console.log("[v0] Web platform detected, skipping permission request");
      return true;
    }

    try {
      console.log("[v0] Requesting permission...");
      const { granted } = await permissionFunc();
      console.log("[v0] Permission granted:", granted);
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

  const pickImageWeb = () => {
    console.log("[v0] Using web image picker");
    return new Promise((resolve) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = (event) => {
        const file = event.target.files[0];
        if (file) {
          console.log("[v0] Web file selected:", file.name);
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
  };

  const pickImage = async () => {
    console.log("[v0] pickImage called, Platform:", Platform.OS);

    if (Platform.OS === "web") {
      try {
        const result = await pickImageWeb();
        console.log("[v0] Web picker result:", result);
        if (!result.canceled && result.assets && result.assets[0]) {
          await uploadAndSendImage(result.assets[0].uri);
        }
      } catch (error) {
        console.error("[v0] Web image picking failed:", error);
        Alert.alert("Error", "Failed to pick image.");
      }
      return;
    }

    if (!ImagePicker) {
      console.log("[v0] ImagePicker not available");
      Alert.alert("Error", "Image picker not available on this platform.");
      return;
    }

    if (
      !(await requestPermission(
        ImagePicker.requestMediaLibraryPermissionsAsync,
        "Gallery access is needed."
      ))
    )
      return;

    try {
      console.log("[v0] Launching native image picker");
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        allowsEditing: true,
      });

      console.log("[v0] Native picker result:", result);
      if (!result.canceled && result.assets && result.assets[0]) {
        await uploadAndSendImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Image picking failed:", error);
      Alert.alert("Error", "Failed to pick image.");
    }
  };

  const takePhoto = async () => {
    console.log("[v0] takePhoto called, ImagePicker available:", !!ImagePicker);

    if (!ImagePicker) {
      Alert.alert("Error", "Camera not available on this platform.");
      return;
    }

    if (
      !(await requestPermission(
        ImagePicker.requestCameraPermissionsAsync,
        "Camera access is needed."
      ))
    )
      return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
        allowsEditing: true,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        await uploadAndSendImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error("Camera failed:", error);
      Alert.alert("Error", "Failed to take photo.");
    }
  };

  const getLocation = async () => {
    console.log("[v0] getLocation called, Location available:", !!Location);
    if (!Location) {
      Alert.alert("Error", "Location services not available on this platform.");
      return;
    }

    if (
      !(await requestPermission(
        Location.requestForegroundPermissionsAsync,
        "Location access is needed."
      ))
    )
      return;

    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      if (location) {
        onSend({
          _id: `${new Date().getTime()}-${userID}`,
          user: { _id: userID },
          location: {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          },
          createdAt: new Date(),
        });
      } else {
        Alert.alert("Error getting location.");
      }
    } catch (error) {
      console.error("Location failed:", error);
      Alert.alert("Error", "Failed to get location.");
    }
  };

  const uploadAndSendImage = async (imageURI) => {
    console.log("[v0] uploadAndSendImage called with URI:", imageURI);
    console.log("[v0] Storage available:", !!storage);
    console.log("[v0] Storage object:", storage);

    if (!storage) {
      Alert.alert("Error", "Storage not configured.");
      return;
    }

    try {
      console.log("[v0] Starting image upload process...");

      let blob;
      if (imageURI.startsWith("data:")) {
        console.log("[v0] Converting data URL to blob");
        const response = await fetch(imageURI);
        blob = await response.blob();
      } else {
        console.log("[v0] Fetching from file URI");
        const response = await fetch(imageURI);
        if (!response.ok) {
          throw new Error("Failed to fetch image");
        }
        blob = await response.blob();
      }

      console.log("[v0] Blob created, size:", blob.size);

      const imageName = `${userID || "unknown"}-${new Date().getTime()}.jpg`;
      const storageRef = ref(storage, `images/${imageName}`);

      console.log("[v0] Uploading to Firebase Storage...");
      await uploadBytes(storageRef, blob);

      console.log("[v0] Getting download URL...");
      const downloadURL = await getDownloadURL(storageRef);

      console.log("[v0] Upload successful, URL:", downloadURL);

      // Create complete message object with proper user data and add comprehensive logging
      const messageObject = {
        _id: `${new Date().getTime()}-${userID || "unknown"}`,
        user: {
          _id: userID || "unknown",
          name: "User", // Default name since we don't have access to user name here
        },
        image: downloadURL,
        createdAt: new Date(),
      };

      console.log(
        "[v0] Sending message object:",
        JSON.stringify(messageObject, null, 2)
      );
      console.log("[v0] Message has image property:", !!messageObject.image);
      console.log("[v0] Image URL:", messageObject.image);

      onSend([messageObject]); // Pass as array since GiftedChat expects array
    } catch (error) {
      console.error("[v0] Upload failed:", error);
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
