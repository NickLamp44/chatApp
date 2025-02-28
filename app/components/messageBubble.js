import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps";

const MessageBubble = ({ currentMessage }) => {
  return (
    <View
      style={[
        styles.bubble,
        currentMessage.user._id === currentMessage.user._id
          ? styles.rightBubble
          : styles.leftBubble,
      ]}
    >
      {/* Text Message */}
      {currentMessage.text ? (
        <Text style={styles.text}>{currentMessage.text}</Text>
      ) : null}

      {/* Image Message */}
      {currentMessage.image ? (
        <Image source={{ uri: currentMessage.image }} style={styles.image} />
      ) : null}

      {/* Location Message */}
      {currentMessage.location ? (
        <MapView
          style={styles.map}
          region={{
            latitude: currentMessage.location.latitude,
            longitude: currentMessage.location.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        >
          <Marker
            coordinate={{
              latitude: currentMessage.location.latitude,
              longitude: currentMessage.location.longitude,
            }}
          />
        </MapView>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  bubble: { padding: 10, borderRadius: 15, margin: 5, maxWidth: "75%" },
  leftBubble: { backgroundColor: "#e1ffc7", alignSelf: "flex-start" },
  rightBubble: { backgroundColor: "#d3f3ff", alignSelf: "flex-end" },
  text: { fontSize: 16 },
  image: { width: 200, height: 200, borderRadius: 10, marginTop: 5 },
  map: { width: 200, height: 150, borderRadius: 10, marginTop: 5 },
});

export default MessageBubble;
