import React from "react";
import { View, Button, TextInput, StyleSheet } from "react-native";

export default function HomeScreen({ navigation }) {
  const [username, setUsername] = React.useState("");

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.input}
        placeholder="Enter your username"
        onChangeText={setUsername}
        value={username}
      />
      <Button
        title="Start Chat"
        onPress={() => navigation.navigate("Chat", { username })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
  },
  input: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    marginBottom: 16,
    paddingHorizontal: 8,
  },
});
