import { createStackNavigator } from "@react-navigation/stack";
// import Login from "../screens/loginScreen";
// import SignUp from "../screens/signUpScreen";
import HomeScreen from "../screens/homeScreen";
import ChatScreen from "../screens/chatScreen";

const Stack = createStackNavigator();

export default function AppNavigator(pProps) {
  return (
    <Stack.Navigator initialRouteName="HomeScreen">
      {/* <Stack.Screen name="Login" component={Login} /> */}
      {/* <Stack.Screen name="SignUp" component={SignUp} /> */}
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen
        name="Chat"
        component={(props) => <ChatScreen db={pProps.db} {...props} />}
      />
    </Stack.Navigator>
  );
}
