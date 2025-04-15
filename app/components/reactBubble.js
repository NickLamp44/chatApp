import React from "react";
import { View, Text, Modal, TouchableOpacity, StyleSheet } from "react-native";

const REACTIONS = ["👍", "❤️", "😂", "🔥", "😮"];

export default function ReactBubble({ visible, onSelect, onClose }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay} pointerEvents="box-none">
        <View style={styles.container}>
          {REACTIONS.map((emoji) => (
            <TouchableOpacity key={emoji} onPress={() => onSelect(emoji)}>
              <Text style={styles.emoji}>{emoji}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.close}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  container: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  emoji: { fontSize: 30, margin: 10 },
  close: { color: "#444", marginTop: 10 },
});
