"use client";

import { View, Text, Image, StyleSheet } from "react-native";
import { useState } from "react";

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
  console.log("  MessageBubble rendering message:", {
    messageId: currentMessage._id,
    hasImage: !!currentMessage.image,
    hasLocation: !!currentMessage.location,
    imageUrl: currentMessage.image,
    location: currentMessage.location,
    messageUser: messageUser,
    currentUser: user,
    isUser: isUser,
  });

  // Generate avatar props
  const avatarColor = messageUser?._id
    ? getAvatarColor(messageUser._id)
    : "#CCCCCC";
  const initials = getUserInitials(messageUser?.name);

  const [useGoogleMaps, setUseGoogleMaps] = useState(true);

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

        {!!currentMessage.location && (
          <View style={styles.locationContainer}>
            <Text style={styles.text}>📍 Location shared</Text>
            <View style={styles.mapContainer}>
              <Image
                source={{
                  uri: `https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s-l+000(${currentMessage.location.longitude},${currentMessage.location.latitude})/${currentMessage.location.longitude},${currentMessage.location.latitude},14/280x160?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw`,
                }}
                style={styles.mapImage}
                onError={() => {
                  console.log("  Map image failed to load");
                }}
              />
              <Text style={styles.coordinatesText}>
                📍 {currentMessage.location.latitude.toFixed(6)},{" "}
                {currentMessage.location.longitude.toFixed(6)}
              </Text>
              <Text
                style={styles.mapLink}
                onPress={() => {
                  const url = `https://www.google.com/maps?q=${currentMessage.location.latitude},${currentMessage.location.longitude}`;
                  if (typeof window !== "undefined") {
                    window.open(url, "_blank");
                  }
                }}
              >
                🗺️ View on Google Maps
              </Text>
            </View>
          </View>
        )}

        {!!currentMessage.text &&
          !currentMessage.image &&
          !currentMessage.location && (
            <Text style={styles.text}>{currentMessage.text}</Text>
          )}

        {!!currentMessage.image && (
          <View>
            <Image
              source={{ uri: currentMessage.image }}
              style={styles.image}
              onLoad={() =>
                console.log("Image loaded successfully:", currentMessage.image)
              }
              onError={(error) =>
                console.log(
                  " Image load error:",
                  error.nativeEvent?.error || error
                )
              }
              onLoadStart={() =>
                console.log(" Image load started:", currentMessage.image)
              }
              onLoadEnd={() =>
                console.log(" Image load ended:", currentMessage.image)
              }
            />
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

  locationContainer: {
    marginVertical: 5,
  },
  mapContainer: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 8,
    marginTop: 5,
  },
  mapImage: {
    width: 280,
    height: 160,
    borderRadius: 8,
    marginBottom: 8,
  },
  coordinatesText: {
    fontSize: 14,
    color: "#666",
    marginBottom: 5,
  },
  mapLink: {
    fontSize: 14,
    color: "#007AFF",
    textDecorationLine: "underline",
  },
});

export default MessageBubble;
