import { View, Text, Image, StyleSheet } from "react-native";

const getAvatarColor = (userId) => {
  const colors = [
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
    "#F1948A",
    "#85C1E9",
    "#D7BDE2",
  ];

  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
};

const getUserInitials = (name) => {
  if (!name) return "?";

  const names = name.trim().split(" ");
  if (names.length === 1) {
    return names[0].charAt(0).toUpperCase();
  }

  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
};

const MessageBubble = ({ currentMessage, user }) => {
  const messageUser = currentMessage.user;
  const isUser = messageUser?._id === user._id;

  // Add comprehensive logging for message rendering
  console.log("[v0] MessageBubble rendering message:", {
    messageId: currentMessage._id,
    hasImage: !!currentMessage.image,
    imageUrl: currentMessage.image,
    messageUser: messageUser,
    currentUser: user,
    isUser: isUser,
  });

  // Generate avatar props
  const avatarColor = messageUser?._id
    ? getAvatarColor(messageUser._id)
    : "#CCCCCC";
  const initials = getUserInitials(messageUser?.name);

  return (
    <View
      style={[
        styles.container,
        isUser ? styles.rightContainer : styles.leftContainer,
      ]}
    >
      {!isUser && (
        <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
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
          <View>
            {/* Add comprehensive image debugging and error handling */}
            <Image
              source={{ uri: currentMessage.image }}
              style={styles.image}
              onLoad={() =>
                console.log(
                  "[v0] Image loaded successfully:",
                  currentMessage.image
                )
              }
              onError={(error) =>
                console.log(
                  "[v0] Image load error:",
                  error.nativeEvent?.error || error
                )
              }
              onLoadStart={() =>
                console.log("[v0] Image load started:", currentMessage.image)
              }
              onLoadEnd={() =>
                console.log("[v0] Image load ended:", currentMessage.image)
              }
            />
            <Text style={styles.debugText}>
              Image URL: {currentMessage.image}
            </Text>
          </View>
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

  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 8,
    justifyContent: "center",
    alignItems: "center",
  },

  avatarText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },

  bubble: {
    padding: 10,
    margin: 10,
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
