import AsyncStorage from "@react-native-async-storage/async-storage";

const MESSAGES_KEY = "chatMessages";

/**
 * Store chat messages locally
 */
export const storeMessages = async (messages) => {
  try {
    await AsyncStorage.setItem(MESSAGES_KEY, JSON.stringify(messages));
  } catch (error) {
    console.error("❌ Failed to store messages", error);
  }
};

/**
 * Retrieve cached messages
 */
export const getStoredMessages = async () => {
  try {
    const stored = await AsyncStorage.getItem(MESSAGES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error("❌ Failed to retrieve messages", error);
    return [];
  }
};

/**
 * Clear cached messages
 */
export const clearStoredMessages = async () => {
  try {
    await AsyncStorage.removeItem(MESSAGES_KEY);
  } catch (error) {
    console.error("❌ Failed to clear messages", error);
  }
};
