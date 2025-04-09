import React, { useEffect } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";
import { signOut } from "firebase/auth";
import { auth } from "../services/firebase";

// Screens
import HomeScreen from "../screens/homeScreen";
import ChatScreen from "../screens/chatScreen";
import ProfileScreen from "../screens/profileScreen";

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator();

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

const LogoutScreen = ({ navigation }) => {
  useEffect(() => {
    signOut(auth)
      .then(() => navigation.replace("Login"))
      .catch((error) => console.error("Logout Failed", error));
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="#000" />
    </View>
  );
};

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

export default function DrawerNavigator() {
  return (
    <Drawer.Navigator screenOptions={{ headerShown: false }}>
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
