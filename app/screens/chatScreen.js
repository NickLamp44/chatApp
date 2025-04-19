import React, { useEffect, useState, useCallback } from "react";
import {
  SafeAreaView,
  TouchableOpacity,
  Platform,
  Text,
  View,
} from "react-native";
import { GiftedChat } from "react-native-gifted-chat";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  listenToMessages,
  sendMessage,
  toggleReaction,
} from "../services/messageService";
import { joinChatRoom } from "../services/chatRoomService";

import MessageBubble from "../components/messageBubble";
import CustomActions from "../components/customAction";
import ReactBubble from "../components/reactBubble";

const ChatScreen = ({ route, navigation }) => {
  const {
    chatRoom_ID,
    userID,
    name,
    email,
    profilePic,
    storage,
    isGuest,
    backgroundColor,
  } = route.params;

  const user = {
    _id: userID,
    name: name || "Guest",
    email: email || "guest@circleup.app",
    avatar: profilePic || null,
  };

  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showPicker, setShowPicker] = useState(false);

  useEffect(() => {
    if (!chatRoom_ID) return;

    const unsubscribe = listenToMessages(setMessages);

    if (!isGuest) joinChatRoom(userID, chatRoom_ID);

    return unsubscribe;
  }, [chatRoom_ID]);

  const onSend = useCallback(
    async (newMessages = []) => {
      setMessages((prev) => GiftedChat.append(prev, newMessages));
      await Promise.all(newMessages.map((msg) => sendMessage(msg, user)));
    },
    [chatRoom_ID, user]
  );

  const handleAddReaction = async (emoji) => {
    if (!selectedMessage) return;

    await toggleReaction(selectedMessage._id, user._id, emoji);
    setShowPicker(false);
    setSelectedMessage(null);
  };

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: backgroundColor || "#fff" }}
    >
      {/* Back Button */}
      <View
        style={{
          paddingTop: Platform.OS === "android" ? 40 : 10,
          paddingHorizontal: 16,
          paddingBottom: 10,
          backgroundColor: backgroundColor || "#fff",
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={{ fontSize: 16, color: "#007AFF" }}>← Back</Text>
        </TouchableOpacity>
      </View>

      {/* Chat */}
      <GiftedChat
        messages={messages}
        onSend={onSend}
        user={user}
        renderBubble={(props) => <MessageBubble {...props} user={user} />}
        renderAvatar={null}
        renderActions={(props) => (
          <CustomActions {...props} user={user} storage={storage} />
        )}
        renderMessage={(props) => (
          <TouchableOpacity
            activeOpacity={0.7}
            onLongPress={() => {
              setSelectedMessage(props.currentMessage);
              setShowPicker(true);
            }}
          >
            <MessageBubble {...props} user={user} />
          </TouchableOpacity>
        )}
      />

      {/* Emoji Picker */}
      <ReactBubble
        visible={showPicker}
        onSelect={handleAddReaction}
        onClose={() => setShowPicker(false)}
      />
    </SafeAreaView>
  );
};

export default ChatScreen;
