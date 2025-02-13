import React from "react";
import { View, Text, Button, StyleSheet } from "react-native";

export default function ProfileScreen({ route, navigation }) {
  const { userID, name } = route.params || { userID: "N/A", name: "Guest" };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>
      <Text style={styles.info}>User ID: {userID}</Text>
      <Text style={styles.info}>Name: {name}</Text>
      <Button title="Go to Home" onPress={() => navigation.navigate("Home")} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  info: {
    fontSize: 18,
    marginBottom: 10,
  },
});
