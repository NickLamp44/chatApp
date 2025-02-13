import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "../app/screens/homeScreen";
import ChatScreen from "../app/screens/chatScreen";
import ProfileScreen from "../app/screens/profileScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator({ db, storage, auth, isConnected }) {
  return (
    <Stack.Navigator initialRouteName="Start">
      <Stack.Screen name="Start" component={HomeScreen} />
      <Stack.Screen name="Chat">
        {(props) => (
          <ChatScreen
            {...props}
            db={db}
            storage={storage}
            auth={auth}
            isConnected={isConnected}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="Profile" component={ProfileScreen} />
    </Stack.Navigator>
  );
}
