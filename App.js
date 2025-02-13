import React, { useEffect } from "react";
import { Alert } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./navigation/appNavigator";
import { useNetInfo } from "@react-native-community/netinfo";
import {
  db,
  storage,
  auth,
  handleNetworkStatus,
} from "./app/services/firebase";

const App = () => {
  const connectionStatus = useNetInfo();

  useEffect(() => {
    if (connectionStatus.isConnected === false) {
      Alert.alert("Connection lost!");
    }

    // Call handleNetworkStatus inside the useEffect
    handleNetworkStatus(connectionStatus.isConnected);
  }, [connectionStatus.isConnected]);

  return (
    <NavigationContainer>
      <AppNavigator
        db={db}
        storage={storage}
        auth={auth}
        isConnected={connectionStatus.isConnected}
      />
    </NavigationContainer>
  );
};

export default App;
