import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function MessageBubble({ text, sender }) {
  return (
    <View
      style={[
        styles.bubble,
        sender === "me" ? styles.bubbleRight : styles.bubbleLeft,
      ]}
    >
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    padding: 10,
    borderRadius: 15,
    margin: 5,
  },
  bubbleLeft: {
    backgroundColor: "#e1ffc7",
    alignSelf: "flex-start",
  },
  bubbleRight: {
    backgroundColor: "#d3f3ff",
    alignSelf: "flex-end",
  },
  text: {
    fontSize: 16,
  },
});
