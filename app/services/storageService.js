import AsyncStorage from "@react-native-async-storage/async-storage";

const storeMessages = async (messages) => {
  try {
    await AsyncStorage.setItem("chatMessages", JSON.stringify(messages));
  } catch (error) {
    console.error("Failed to store messages", error);
  }
};

const getStoredMessages = async () => {
  try {
    const messages = await AsyncStorage.getItem("chatMessages");
    return messages ? JSON.parse(messages) : [];
  } catch (error) {
    console.error("Failed to retrieve messages", error);
    return [];
  }
};

export { storeMessages, getStoredMessages };
