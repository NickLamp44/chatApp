import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

const MessageBubble = ({ currentMessage, userID }) => {
  const isUser = currentMessage.user._id === userID;

  return (
    <View
      style={[styles.bubble, isUser ? styles.rightBubble : styles.leftBubble]}
    >
      {currentMessage.text && (
        <Text style={styles.text}>{currentMessage.text}</Text>
      )}

      {currentMessage.image && (
        <Image source={{ uri: currentMessage.image }} style={styles.image} />
      )}
    </View>
  );
};

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
  image: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginTop: 5,
  },
});

export default MessageBubble;
