// ChatScreen
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
  getDoc,
  setDoc,
} from "firebase/firestore";

// Import components
import CustomActions from "../components/customAction";
import MessageBubble from "../components/messageBubble";

// Conditionally load MapView for native platforms
let MapView;
if (Platform.OS !== "web") {
  try {
    MapView = require("react-native-maps").default;
  } catch (error) {
    console.error("❌ Error loading react-native-maps:", error);
  }
}

const ChatScreen = ({ route }) => {
  const { userID, name, db, storage, isConnected } = route.params;
  const [messages, setMessages] = useState([]);

  console.log("ChatScreen: 🔥 Firestore DB Instance:", db);

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
      const loadedMessages = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          _id: doc.id,
          text: data.text || "",
          createdAt: data.createdAt?.toDate() || new Date(),
          user: data.user || { _id: "unknown", name: "Unknown" },
          image: data.image || null,
          location: data.location || null,
        };
      });

      setMessages(loadedMessages);
      await AsyncStorage.setItem(
        "cachedMessages",
        JSON.stringify(loadedMessages)
      );
    });

    return () => unsubscribe();
  }, [isConnected]);

  const onSend = useCallback(
    async (newMessages = []) => {
      setMessages((prevMessages) =>
        GiftedChat.append(prevMessages, newMessages)
      );

      try {
        await Promise.all(
          newMessages.map(async (message) => {
            const formattedUser = message.user || {
              _id: userID,
              name: name || "Unknown",
            };

            const messageRef = await addDoc(collection(db, "Messages"), {
              _id: message._id,
              text: message.text || "",
              image: message.image || null,
              location: message.location || null,
              createdAt: serverTimestamp(),
              user: formattedUser,
            });

            console.log("✅ Message added to Firestore:", messageRef.id);

            const userRef = doc(db, "Users", userID);
            const userDoc = await getDoc(userRef);
            if (!userDoc.exists()) {
              await setDoc(userRef, { messages: [messageRef.id] });
            } else {
              await updateDoc(userRef, {
                messages: arrayUnion(messageRef.id),
              });
            }

            console.log("✅ User document updated with new message ID.");
          })
        );
      } catch (error) {
        console.error("❌ Error sending messages:", error);
      }
    },
    [userID, name, db]
  );

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <GiftedChat
        messages={messages}
        onSend={onSend}
        user={{ _id: userID, name }}
        renderBubble={(props) => <MessageBubble {...props} userID={userID} />}
        renderAvatar={() => null}
        renderActions={(props) => (
          <CustomActions
            {...props}
            onSend={onSend}
            storage={storage}
            userID={userID}
          />
        )}
      />
    </SafeAreaView>
  );
};

export default ChatScreen;
