import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Ensure expo-icons is installed
import HomeScreen from "../screens/homeScreen";
import ChatScreen from "../screens/chatScreen";
import ProfileScreen from "../screens/profileScreen";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebaseAuth";

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

// **Custom Header with Menu Icon**
const CustomHeader = ({ navigation, title }) => (
  <View style={{ flexDirection: "row", alignItems: "center", padding: 15 }}>
    <TouchableOpacity onPress={() => navigation.openDrawer()}>
      <Ionicons name="menu" size={28} color="black" />
    </TouchableOpacity>
    <Text style={{ fontSize: 20, fontWeight: "bold", marginLeft: 20 }}>
      {title}
    </Text>
  </View>
);

// **Main Drawer Navigator**
export default function DrawerNavigator() {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Drawer.Screen name="Home" component={HomeStack} />
      <Drawer.Screen name="Profile" component={ProfileScreen} />
      <Drawer.Screen
        name="Logout"
        component={LogoutScreen}
        options={{ title: "🚪 Logout" }}
      />
    </Drawer.Navigator>
  );
}

// **Home Stack (For Home & Chat)**
const HomeStack = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="HomeScreen"
      component={HomeScreen}
      options={({ navigation }) => ({
        header: () => <CustomHeader navigation={navigation} title="Home" />,
      })}
    />
    <Stack.Screen
      name="Chat"
      component={ChatScreen}
      options={({ navigation }) => ({
        header: () => <CustomHeader navigation={navigation} title="Chat" />,
      })}
    />
  </Stack.Navigator>
);

// **Logout Screen (Triggers Sign Out)**
const LogoutScreen = ({ navigation }) => {
  signOut(auth)
    .then(() => navigation.replace("Login"))
    .catch((error) => console.error("Logout Failed", error));

  return null;
};
