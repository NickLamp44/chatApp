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
  doc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import { db } from "../services/firebase";

// Import components
import CustomActions from "../components/customAction";
import MessageBubble from "../components/messageBubble";

let MapView;
if (Platform.OS !== "web") {
  try {
    MapView = require("react-native-maps").default;
  } catch (error) {
    console.error("react-native-maps failed to load:", error);
  }
}

const ChatScreen = ({ route, storage, isConnected }) => {
  const { userID, name } = route.params;
  const [messages, setMessages] = useState([]);

  console.log("🔥 Firestore DB Instance:", db);

  useEffect(() => {
    if (!db) {
      console.error("❌ Firestore `db` is undefined! Check your imports.");
      return;
    }

    if (!isConnected) {
      AsyncStorage.getItem("cachedMessages").then((cachedMessages) => {
        if (cachedMessages) setMessages(JSON.parse(cachedMessages));
      });
      return;
    }

    const q = query(collection(db, "Messages"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const loadedMessages = snapshot.docs.map((doc) => ({
        _id: doc.id,
        text: doc.data().text || "",
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        user: doc.data().user,
      }));

      setMessages(loadedMessages);
      await AsyncStorage.setItem(
        "cachedMessages",
        JSON.stringify(loadedMessages)
      );
    });

    return () => unsubscribe();
  }, [db, isConnected]);

  const onSend = useCallback(
    async (newMessages = []) => {
      setMessages((prevMessages) =>
        GiftedChat.append(prevMessages, newMessages)
      );

      try {
        await Promise.all(
          newMessages.map(async (message) => {
            const formattedUser = message.user
              ? message.user
              : { _id: userID, name: name || "Unknown" };

            const messageRef = await addDoc(collection(db, "Messages"), {
              _id: message._id,
              text: message.text || "",
              createdAt: serverTimestamp(),
              user: formattedUser,
            });

            console.log(
              "✅ Message successfully added to Firestore:",
              messageRef.id
            );

            const userRef = doc(db, "Users", userID);
            await updateDoc(userRef, {
              messages: arrayUnion(messageRef.id),
            });

            console.log("✅ User document updated with new message ID.");
          })
        );
      } catch (error) {
        console.error("❌ Error sending messages:", error);
      }
    },
    [userID, name]
  );

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
      />
    </SafeAreaView>
  );
};

export default ChatScreen;
