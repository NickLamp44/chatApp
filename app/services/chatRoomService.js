import {
  collection,
  addDoc,
  doc,
  updateDoc,
  getDoc,
  arrayUnion,
  query,
  orderBy,
  getDocs,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "./firebase";

// Send a message to a chat room
export const sendMessage = async (chatRoom_ID, sender, text) => {
  try {
    const message = {
      text,
      createdAt: serverTimestamp(),
      user: sender,
      likedBy: [],
    };

    const roomRef = collection(db, `ChatRooms/${chatRoom_ID}/Messages`);
    const docRef = await addDoc(roomRef, message);

    return docRef.id;
  } catch (error) {
    console.error("❌ Error sending message:", error.message);
    throw error;
  }
};

// Like a message
export const likeMessage = async (chatRoom_ID, message_ID, user_ID) => {
  try {
    const msgRef = doc(db, `ChatRooms/${chatRoom_ID}/Messages`, message_ID);
    await updateDoc(msgRef, {
      likedBy: arrayUnion(user_ID),
    });
  } catch (error) {
    console.error("❌ Error liking message:", error.message);
    throw error;
  }
};

// Reply to a message
export const replyToMessage = async (
  chatRoom_ID,
  message_ID,
  sender,
  replyText
) => {
  try {
    const reply = {
      text: replyText,
      createdAt: serverTimestamp(),
      user: sender,
      replyTo: message_ID,
    };

    const repliesRef = collection(
      db,
      `ChatRooms/${chatRoom_ID}/Messages/${message_ID}/Replies`
    );
    const docRef = await addDoc(repliesRef, reply);

    return docRef.id;
  } catch (error) {
    console.error("❌ Error replying to message:", error.message);
    throw error;
  }
};

// Join a chat room
export const joinChatRoom = async (user_ID, chatRoom_ID) => {
  try {
    const userRef = doc(db, "Users", user_ID);
    const chatRoomRef = doc(db, "ChatRooms", chatRoom_ID);

    await updateDoc(chatRoomRef, {
      members: arrayUnion(user_ID),
    });

    await updateDoc(userRef, {
      chatRoomsJoined: arrayUnion(chatRoom_ID),
    });
  } catch (error) {
    console.error("❌ Error joining chat room:", error.message);
    throw error;
  }
};

// Get all messages from a chat room
export const getMessages = async (chatRoom_ID) => {
  try {
    const q = query(
      collection(db, `ChatRooms/${chatRoom_ID}/Messages`),
      orderBy("createdAt", "desc")
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({
      _id: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error("❌ Error getting messages:", error.message);
    throw error;
  }
};

// Get all chat rooms a user has joined
export const getChatRooms = async (user_ID) => {
  try {
    const userSnap = await getDoc(doc(db, "Users", user_ID));
    if (!userSnap.exists()) return [];

    return userSnap.data().chatRoomsJoined || [];
  } catch (error) {
    console.error("❌ Error fetching user chat rooms:", error.message);
    throw error;
  }
};
