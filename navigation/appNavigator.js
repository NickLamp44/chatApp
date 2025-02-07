import React from "react";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "../app/screens/homeScreen";
import ChatScreen from "../app/screens/chatScreen";
import { NavigationContainer } from "@react-navigation/native";

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Chat" component={ChatScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
