import { createStackNavigator } from "@react-navigation/stack";
import Login from "../screens/loginScreen";
import SignUp from "../screens/signUpScreen";
import HomeScreen from "../screens/homeScreen";
import ChatScreen from "../screens/chatScreen";
import CreateRoomScreen from "../screens/createRoomScreen";

const Stack = createStackNavigator();

export default function AppNavigator({ db, storage, isConnected }) {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Login" component={Login} />
      <Stack.Screen name="SignUp" component={SignUp} />
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="CreateRoomScreen" component={CreateRoomScreen} />
      <Stack.Screen
        name="Chat"
        component={ChatScreen}
        initialParams={{ db, storage, isConnected }}
      />
    </Stack.Navigator>
  );
}
