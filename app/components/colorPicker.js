"use client";

import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  TextInput,
  Alert,
} from "react-native";

const ColorPicker = ({ visible, onClose, onColorSelect, currentColor }) => {
  const [customColor, setCustomColor] = useState("");

  const presetColors = ["#090C08", "#474056", "#8A95A5", "#B9C6AE"];

  const popularColors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEAA7",
    "#DDA0DD",
    "#98D8C8",
    "#F7DC6F",
    "#BB8FCE",
    "#85C1E9",
    "#F8C471",
    "#82E0AA",
  ];

  const handleCustomColorSubmit = () => {
    const color = customColor.trim();

    // Basic hex color validation
    if (!/^#[0-9A-F]{6}$/i.test(color)) {
      Alert.alert(
        "Invalid Color",
        "Please enter a valid hex color (e.g., #FF5733)"
      );
      return;
    }

    onColorSelect(color);
    setCustomColor("");
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Choose Background Color</Text>

          {/* Preset Colors */}
          <Text style={styles.sectionTitle}>Default Colors</Text>
          <View style={styles.colorGrid}>
            {presetColors.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                  currentColor === color && styles.selectedColor,
                ]}
                onPress={() => {
                  onColorSelect(color);
                  onClose();
                }}
              />
            ))}
          </View>

          {/* Popular Colors */}
          <Text style={styles.sectionTitle}>Popular Colors</Text>
          <View style={styles.colorGrid}>
            {popularColors.map((color) => (
              <TouchableOpacity
                key={color}
                style={[
                  styles.colorOption,
                  { backgroundColor: color },
                  currentColor === color && styles.selectedColor,
                ]}
                onPress={() => {
                  onColorSelect(color);
                  onClose();
                }}
              />
            ))}
          </View>

          {/* Custom Color Input */}
          <Text style={styles.sectionTitle}>Custom Color</Text>
          <View style={styles.customColorContainer}>
            <TextInput
              style={styles.customColorInput}
              value={customColor}
              onChangeText={setCustomColor}
              placeholder="#FF5733"
              placeholderTextColor="#999"
              maxLength={7}
              autoCapitalize="characters"
            />
            <TouchableOpacity
              style={styles.customColorButton}
              onPress={handleCustomColorSubmit}
            >
              <Text style={styles.customColorButtonText}>Apply</Text>
            </TouchableOpacity>
          </View>

          {/* Close Button */}
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    backgroundColor: "white",
    borderRadius: 20,
    padding: 20,
    width: "90%",
    maxHeight: "80%",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "500",
    marginTop: 15,
    marginBottom: 10,
    color: "#555",
  },
  colorGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  colorOption: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginBottom: 10,
    borderWidth: 2,
    borderColor: "transparent",
  },
  selectedColor: {
    borderColor: "#000",
    borderWidth: 3,
  },
  customColorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  customColorInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginRight: 10,
  },
  customColorButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  customColorButtonText: {
    color: "white",
    fontWeight: "600",
  },
  closeButton: {
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  closeButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
});

export default ColorPicker;
