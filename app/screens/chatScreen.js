"use client";

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
import { getStoredMessages } from "../services/storageService";

import MessageBubble from "../components/messageBubble";
import CustomActions from "../components/customAction";
import ReactBubble from "../components/reactBubble";

const ChatScreen = ({ route, navigation }) => {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showPicker, setShowPicker] = useState(false);
  const [user, setUser] = useState(null);
  const [chatRoomID, setChatRoomID] = useState(route.params?.chatRoom_ID);

  /**
   * Rehydrate user from AsyncStorage
   */
  useEffect(() => {
    const loadUser = async () => {
      try {
        const saved = await AsyncStorage.getItem("user");
        if (!saved) {
          Alert.alert("Error", "No user found, returning home.");
          navigation.replace("HomeScreen");
          return;
        }

        const userData = JSON.parse(saved);

        setUser({
          _id: userData.userID,
          name: userData.name || "Guest",
          email: userData.email || "guest@circleup.app",
          avatar: userData.profilePic || null,
          isGuest: userData.isGuest || false,
        });

        if (!chatRoomID && route.params?.chatRoom_ID) {
          setChatRoomID(route.params.chatRoom_ID);
        }
      } catch (err) {
        console.error("❌ Failed to load user", err);
        navigation.replace("HomeScreen");
      }
    };

    loadUser();
  }, [route.params]);

  /**
   * Load cached messages first, then subscribe to Firestore
   */
  useEffect(() => {
    if (!chatRoomID || !user) return;

    // Step 1: hydrate cached messages instantly
    const hydrateFromCache = async () => {
      const cached = await getStoredMessages();
      if (cached.length > 0) {
        setMessages(cached);
      }
    };

    hydrateFromCache();

    // Step 2: live listener
    const unsubscribe = listenToMessages(chatRoomID, setMessages);

    // Step 3: ensure user is joined to room
    if (!user.isGuest) {
      joinChatRoom(user._id, chatRoomID).catch((err) =>
        console.error("❌ Failed to join chat room", err)
      );
    }

    return unsubscribe;
  }, [chatRoomID, user]);

  /**
   * Send new messages
   */
  const onSend = useCallback(
    async (newMessages = []) => {
      setMessages((prev) => GiftedChat.append(prev, newMessages));
      try {
        await Promise.all(
          newMessages.map((msg) => sendMessage(msg, user, chatRoomID))
        );
      } catch (err) {
        console.error("❌ Failed to send message", err);
      }
    },
    [chatRoomID, user]
  );

  /**
   * Add emoji reactions
   */
  const handleAddReaction = async (emoji) => {
    if (!selectedMessage) return;
    try {
      await toggleReaction(chatRoomID, selectedMessage._id, user._id, emoji);
    } catch (err) {
      console.error("❌ Failed to toggle reaction", err);
    }
    setSelectedMessage(null);
    setShowPicker(false);
  };

  if (!user) return null; // Still loading user

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
      <View style={styles.chatContainer}>
        <GiftedChat
          messages={messages}
          onSend={onSend}
          user={user}
          renderBubble={(props) => <MessageBubble {...props} user={user} />}
          renderAvatar={null}
          renderActions={(props) => (
            <CustomActions {...props} user={user} onSend={onSend} />
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
          keyboardShouldPersistTaps="handled"
          messagesContainerStyle={styles.messagesContainer}
        />
      </View>

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
  container: {
    flex: 1,
    height: "100vh",
    maxHeight: "100vh",
  },
  chatContainer: {
    flex: 1,
    minHeight: 0, // Prevents flex child from overflowing
  },
  header: {
    paddingTop: Platform.OS === "android" ? 40 : 10,
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
    flexShrink: 0,
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
