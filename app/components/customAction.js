import React from "react";
import { TouchableOpacity, Text, View, StyleSheet, Alert } from "react-native";
import { useActionSheet } from "@expo/react-native-action-sheet";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const CustomActions = ({ onSend, storage, userID }) => {
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
        if (buttonIndex === 0) await pickImage();
        if (buttonIndex === 1) await takePhoto();
        if (buttonIndex === 2) await getLocation();
      }
    );
  };

  const requestPermission = async (permissionFunc, alertMessage) => {
    const { granted } = await permissionFunc();
    if (!granted) Alert.alert(alertMessage);
    return granted;
  };

  const pickImage = async () => {
    if (
      !(await requestPermission(
        ImagePicker.requestMediaLibraryPermissionsAsync,
        "Gallery access is needed."
      ))
    )
      return;

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });
    if (!result.canceled) await uploadAndSendImage(result.assets[0].uri);
  };

  const takePhoto = async () => {
    if (
      !(await requestPermission(
        ImagePicker.requestCameraPermissionsAsync,
        "Camera access is needed."
      ))
    )
      return;

    let result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });
    if (!result.canceled) await uploadAndSendImage(result.assets[0].uri);
  };

  const getLocation = async () => {
    if (
      !(await requestPermission(
        Location.requestForegroundPermissionsAsync,
        "Location access is needed."
      ))
    )
      return;

    const location = await Location.getCurrentPositionAsync({});
    if (location) {
      onSend({
        _id: `${new Date().getTime()}-${userID}`,
        user: { _id: userID },
        location: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
      });
    } else {
      Alert.alert("Error getting location.");
    }
  };

  const uploadAndSendImage = async (imageURI) => {
    try {
      const imageName = `${userID}-${new Date().getTime()}-${imageURI
        .split("/")
        .pop()}`;
      const storageRef = ref(storage, imageName);
      const response = await fetch(imageURI);
      const blob = await response.blob();
      await uploadBytes(storageRef, blob);
      const downloadURL = await getDownloadURL(storageRef);

      onSend({
        _id: `${new Date().getTime()}-${userID}`,
        user: { _id: userID },
        image: downloadURL,
      });
    } catch (error) {
      console.error("Upload failed:", error);
      Alert.alert("Image upload failed.");
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
