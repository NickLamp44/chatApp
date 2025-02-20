import React, { useState, useEffect, useCallback } from "react";
import { GiftedChat } from "react-native-gifted-chat";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";

// Import components
import CustomActions from "../components/customAction";
import MessageBubble from "../components/messageBubble";

// Conditionally import `react-native-maps` for non-web platforms
let MapView;
if (Platform.OS !== "web") {
  try {
    MapView = require("react-native-maps").default;
  } catch (error) {
    console.error("react-native-maps failed to load:", error);
  }
}

const ChatScreen = ({ route, db, storage, isConnected }) => {
  const { userID, name } = route.params;
  const [messages, setMessages] = useState([]);

  /**
   * Fetch messages from Firestore (if online) or AsyncStorage (if offline)
   */
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        if (isConnected) {
          const q = query(
            collection(db, "messages"),
            orderBy("createdAt", "desc")
          );
          const unsubscribe = onSnapshot(q, async (snapshot) => {
            const loadedMessages = snapshot.docs.map((doc) => ({
              _id: doc.id,
              text: doc.data().text || "",
              createdAt: doc.data().createdAt?.toDate() || new Date(),
              user: doc.data().user,
            }));
            setMessages(loadedMessages);

            // Cache messages for offline use
            await AsyncStorage.setItem(
              "cachedMessages",
              JSON.stringify(loadedMessages)
            );
          });

          return () => unsubscribe();
        } else {
          // Load messages from cache if offline
          const cachedMessages = await AsyncStorage.getItem("cachedMessages");
          if (cachedMessages) setMessages(JSON.parse(cachedMessages));
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [db, isConnected]);

  /**
   * Handles sending messages
   */
  const onSend = useCallback((newMessages = []) => {
    setMessages((prevMessages) => GiftedChat.append(prevMessages, newMessages));

    newMessages.forEach(async (message) => {
      await addDoc(collection(db, "messages"), {
        ...message,
        createdAt: serverTimestamp(),
      });
    });
  }, []);

  /**
   * Render custom views such as maps (for location messages)
   */
  const renderCustomView = (props) => {
    const { currentMessage } = props;
    if (currentMessage?.location && MapView) {
      return (
        <MapView
          style={{ width: 150, height: 100, borderRadius: 10, margin: 5 }}
          region={{
            latitude: currentMessage.location.latitude,
            longitude: currentMessage.location.longitude,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          }}
        />
      );
    }
    return null;
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <GiftedChat
        messages={messages}
        onSend={onSend}
        user={{ _id: userID, name }}
        renderActions={(props) => (
          <CustomActions {...props} storage={storage} userID={userID} />
        )}
        renderBubble={(props) => <MessageBubble {...props} />}
        renderMessageImage={(props) => (
          <Image
            source={{ uri: props.currentMessage.image }}
            style={{ width: 200, height: 200, borderRadius: 10 }}
          />
        )}
      />
    </SafeAreaView>
  );
};

export default ChatScreen;
