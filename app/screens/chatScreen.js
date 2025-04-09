import React, { useState, useEffect, useCallback } from "react";
import { Platform } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GiftedChat } from "react-native-gifted-chat";
import AsyncStorage from "@react-native-async-storage/async-storage";

import CustomActions from "../components/customAction";
import MessageBubble from "../components/messageBubble";
import {
  sendMessage,
  listenToMessagesWithExtras,
} from "../services/messageService";

let MapView;
if (Platform.OS !== "web") {
  try {
    MapView = require("react-native-maps").default;
  } catch (error) {
    console.error("❌ MapView load error:", error);
  }
}

const ChatScreen = ({ route }) => {
  const { userID, name, email, profilePic, storage, isConnected } =
    route.params;

  const user = {
    _id: userID,
    name,
    email,
    avatar: profilePic || undefined,
  };

  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!isConnected) {
      AsyncStorage.getItem("cachedMessages").then((cached) => {
        if (cached) setMessages(JSON.parse(cached));
      });
      return;
    }

    const unsubscribe = listenToMessagesWithExtras(setMessages);
    return () => unsubscribe();
  }, [isConnected]);

  const onSend = useCallback(
    async (newMessages = []) => {
      setMessages((prevMessages) =>
        GiftedChat.append(prevMessages, newMessages)
      );

      try {
        await Promise.all(
          newMessages.map((message) => sendMessage(message, user))
        );
      } catch (error) {
        console.error("❌ Error sending messages:", error);
      }
    },
    [user]
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <GiftedChat
        messages={messages}
        onSend={onSend}
        user={user}
        renderBubble={(props) => <MessageBubble {...props} user={user} />}
        renderActions={(props) => (
          <CustomActions
            {...props}
            onSend={onSend}
            user={user}
            storage={storage}
          />
        )}
      />
    </SafeAreaView>
  );
};

export default ChatScreen;
