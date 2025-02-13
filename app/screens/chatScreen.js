import React, { useState, useEffect, useCallback } from "react";
import { GiftedChat } from "react-native-gifted-chat";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import CustomActions from "../components/customAction";
import MessageBubble from "../components/messageBubble";

export default function ChatScreen({ route, db, storage }) {
  const { userID, name } = route.params;
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "messages"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedMessages = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          _id: doc.id,
          text: data.text || "",
          createdAt: data.createdAt?.toDate() || new Date(),
          user: data.user,
        };
      });
      setMessages(loadedMessages);
    });

    return () => unsubscribe();
  }, [db]);

  const onSend = useCallback((newMessages = []) => {
    setMessages((prevMessages) => GiftedChat.append(prevMessages, newMessages));
    addDoc(collection(db, "messages"), {
      ...newMessages[0],
      createdAt: serverTimestamp(),
    });
  }, []);

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
}
