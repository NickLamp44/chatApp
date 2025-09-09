import { createStackNavigator } from "@react-navigation/stack";
import Login from "../screens/loginScreen";
import SignUp from "../screens/signUpScreen";
import HomeScreen from "../screens/homeScreen";
import ChatScreen from "../screens/chatScreen";
import CreateRoomScreen from "../screens/createRoomScreen";

const Stack = createStackNavigator();

export default function AppNavigator({ isConnected, user }) {
  const initialRoute = user ? "HomeScreen" : "Login";
  console.log(
    " AppNavigator rendering with initialRoute:",
    initialRoute,
    "user:",
    user ? "present" : "null"
  );

  return (
    <Stack.Navigator
      initialRouteName={initialRoute}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="SignUp" component={SignUp} />
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="CreateRoomScreen" component={CreateRoomScreen} />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        initialParams={{ isConnected }}
      />
    </Stack.Navigator>
  );
}
