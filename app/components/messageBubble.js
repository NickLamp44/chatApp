import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function MessageBubble({ currentMessage }) {
  return (
    <View
      style={[
        styles.bubble,
        currentMessage.user._id === 1 ? styles.rightBubble : styles.leftBubble,
      ]}
    >
      <Text style={styles.text}>{currentMessage.text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    padding: 10,
    borderRadius: 15,
    margin: 5,
    maxWidth: "75%",
  },
  leftBubble: {
    backgroundColor: "#e1ffc7",
    alignSelf: "flex-start",
  },
  rightBubble: {
    backgroundColor: "#d3f3ff",
    alignSelf: "flex-end",
  },
  text: {
    fontSize: 16,
  },
});
