import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

const MessageBubble = ({ currentMessage, user }) => {
  const messageUser = currentMessage.user;
  const isUser = messageUser?._id === user._id;

  return (
    <View
      style={[
        styles.container,
        isUser ? styles.rightContainer : styles.leftContainer,
      ]}
    >
      {!isUser && messageUser?.avatar && (
        <Image source={{ uri: messageUser.avatar }} style={styles.avatar} />
      )}

      <View
        style={[styles.bubble, isUser ? styles.rightBubble : styles.leftBubble]}
      >
        {!isUser && messageUser?.name && (
          <Text style={styles.username}>{messageUser.name}</Text>
        )}

        {currentMessage.replyTo && (
          <Text style={styles.replyText}>↪️ Replying to message...</Text>
        )}

        {!!currentMessage.text && (
          <Text style={styles.text}>{currentMessage.text}</Text>
        )}

        {!!currentMessage.image && (
          <Image source={{ uri: currentMessage.image }} style={styles.image} />
        )}

        {Array.isArray(currentMessage.likedBy) &&
          currentMessage.likedBy.length > 0 && (
            <View style={styles.reactionsContainer}>
              {currentMessage.likedBy.map((reaction, idx) => (
                <Text key={idx} style={styles.reaction}>
                  {reaction}
                </Text>
              ))}
            </View>
          )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    marginVertical: 4,
    maxWidth: "80%",
  },
  leftContainer: { alignSelf: "flex-start" },
  rightContainer: { alignSelf: "flex-end", flexDirection: "row-reverse" },

  avatar: { width: 30, height: 30, borderRadius: 15, marginRight: 8 },

  bubble: {
    padding: 10,
    borderRadius: 15,
  },
  leftBubble: { backgroundColor: "#e1ffc7" },
  rightBubble: { backgroundColor: "#d3f3ff" },

  username: {
    fontSize: 12,
    fontWeight: "600",
    color: "#555",
    marginBottom: 3,
  },
  replyText: {
    fontSize: 12,
    color: "#888",
    fontStyle: "italic",
    marginBottom: 5,
  },
  text: { fontSize: 16, lineHeight: 22 },

  image: {
    width: 200,
    height: 200,
    borderRadius: 10,
    marginTop: 5,
  },
  reactionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 4,
  },
  reaction: {
    fontSize: 14,
    marginRight: 4,
  },
});

export default MessageBubble;
