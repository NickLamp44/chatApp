import React from "react";
import { View, Text, StyleSheet } from "react-native";

const MessageBubble = ({ currentMessage }) => (
  <View
    style={[
      styles.bubble,
      currentMessage.user._id === userId
        ? styles.rightBubble
        : styles.leftBubble,
    ]}
  >
    <Text style={styles.text}>{currentMessage.text}</Text>
  </View>
);

const styles = StyleSheet.create({
  bubble: { padding: 10, borderRadius: 15, margin: 5, maxWidth: "75%" },
  leftBubble: { backgroundColor: "#e1ffc7", alignSelf: "flex-start" },
  rightBubble: { backgroundColor: "#d3f3ff", alignSelf: "flex-end" },
  text: { fontSize: 16 },
});

export default MessageBubble;
