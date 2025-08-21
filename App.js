import React, { useEffect, useRef } from "react";
import { Alert } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./app/navigation/appNavigator";
import { useNetInfo } from "@react-native-community/netinfo";

const App = () => {
  const { isConnected } = useNetInfo();
  const hasShownAlert = useRef(false);

  useEffect(() => {
    if (isConnected === false && !hasShownAlert.current) {
      Alert.alert(
        "⚠️ Connection Lost",
        "You're offline. Some features may not work."
      );
      hasShownAlert.current = true;
    } else if (isConnected === true) {
      hasShownAlert.current = false;
    }
  }, [isConnected]);

  return (
    <NavigationContainer>
      <AppNavigator isConnected={!!isConnected} />
    </NavigationContainer>
  );
};

export default App;
