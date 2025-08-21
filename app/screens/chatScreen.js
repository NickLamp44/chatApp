import { useEffect, useState, useCallback } from "react";
import {
  SafeAreaView,
  TouchableOpacity,
  Platform,
  Text,
  View,
  Alert,
  StyleSheet,
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
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [user, setUser] = useState(null);
  const [chatRoomID, setChatRoomID] = useState(route.params?.chatRoom_ID);

  // Rehydrate user on mount
  useEffect(() => {
    const loadUser = async () => {
      let userData = null;
      const saved = await AsyncStorage.getItem("user");
      if (saved) userData = JSON.parse(saved);

      if (!userData) {
        Alert.alert("Error", "No user found, returning home.");
        navigation.replace("HomeScreen");
        return;
      }

      setUser({
        _id: userData.userID,
        name: userData.name || "Guest",
        email: userData.email || "guest@circleup.app",
        avatar: userData.profilePic || null,
      });

      if (!chatRoomID && route.params?.chatRoom_ID) {
        setChatRoomID(route.params.chatRoom_ID);
      }
    };

    loadUser();
  }, [route.params]);

  // Setup message listener
  useEffect(() => {
    if (!chatRoomID || !user) return;

    const unsubscribe = listenToMessages(chatRoomID, setMessages);
    if (!user.isGuest) joinChatRoom(user._id, chatRoomID);

    return unsubscribe;
  }, [chatRoomID, user]);

  const onSend = useCallback(
    async (newMessages = []) => {
      setMessages((prev) => GiftedChat.append(prev, newMessages));
      await Promise.all(
        newMessages.map((msg) => sendMessage(msg, user, chatRoomID))
      );
    },
    [chatRoomID, user]
  );

  const handleAddReaction = async (emoji) => {
    if (!selectedMessage) return;
    await toggleReaction(selectedMessage._id, user._id, emoji);
    setSelectedMessage(null);
    setShowPicker(false);
  };

  if (!user) return null; // Loading state

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: "#fff" }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: "#fff" }]}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.replace("HomeScreen")}
          activeOpacity={0.7}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
      </View>

      {/* Chat UI */}
      <GiftedChat
        messages={messages}
        onSend={onSend}
        user={user}
        renderBubble={(props) => <MessageBubble {...props} user={user} />}
        renderAvatar={null}
        renderActions={(props) => <CustomActions {...props} user={user} />}
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
        keyboardShouldPersistTaps="handled"
        messagesContainerStyle={styles.messagesContainer}
      />

      {/* Reactions */}
      <ReactBubble
        visible={showPicker}
        onSelect={handleAddReaction}
        onClose={() => setShowPicker(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    paddingTop: Platform.OS === "android" ? 40 : 10,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  backButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  backText: {
    fontSize: 24,
    color: "#007AFF",
    fontWeight: "500",
  },
  messagesContainer: {
    padding: 16,
  },
});

export default ChatScreen;
