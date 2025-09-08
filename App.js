"use client";

import { useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./app/navigation/appNavigator";
import { useNetInfo } from "@react-native-community/netinfo";
import { onAuthStateChange } from "./app/services/firebaseAuth";

const App = () => {
  const { isConnected } = useNetInfo();
  const hasShownAlert = useRef(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log(
      " Auth state changed:",
      user ? "User logged in" : "User logged out"
    );
    const unsubscribe = onAuthStateChange((userData) => {
      setUser(userData);
      setIsLoading(false);
    });

    return unsubscribe; // Cleanup listener on unmount
  }, []);

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

  if (isLoading) {
    return null; // Or a loading component
  }

  console.log(
    " App rendering with user:",
    user ? "authenticated" : "not authenticated"
  );

  return (
    <NavigationContainer>
      <AppNavigator
        isConnected={!!isConnected}
        user={user}
        key={user ? user.uid : "no-user"}
      />
    </NavigationContainer>
  );
};

export default App;
