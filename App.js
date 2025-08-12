import React, { useEffect, useMemo, useRef } from "react";
import { Alert } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./app/navigation/appNavigator";
import NetInfo, { useNetInfo } from "@react-native-community/netinfo";
import { db, storage } from "./app/services/firebase";

const App = () => {
  const connectionStatus = useNetInfo();
  const hasShownAlert = useRef(false);

  useEffect(() => {
    if (connectionStatus.isConnected === false && !hasShownAlert.current) {
      Alert.alert(
        "⚠️ Connection Lost",
        "You're offline. Some features may not work."
      );
      hasShownAlert.current = true;
    } else if (connectionStatus.isConnected === true) {
      hasShownAlert.current = false; // Reset alert state
    }
  }, [connectionStatus.isConnected]);

  const memoizedDb = useMemo(() => db, []);
  const memoizedStorage = useMemo(() => storage, []);

  return (
    <NavigationContainer>
      <AppNavigator
        db={memoizedDb}
        storage={memoizedStorage}
        isConnected={connectionStatus.isConnected}
      />
    </NavigationContainer>
  );
};

export default App;
