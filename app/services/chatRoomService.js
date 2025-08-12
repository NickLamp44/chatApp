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
import * as Crypto from "expo-crypto";

const hashPassword = async (password) =>
  await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, password);

export const createChatRoom = async (
  chatRoomID,
  chatRoomName,
  isPrivate = false,
  roomPassword = null
) => {
  try {
    const roomRef = doc(db, "ChatRooms", chatRoomID);

    const hashedPassword =
      isPrivate && roomPassword ? await hashPassword(roomPassword) : null;

    await setDoc(roomRef, {
      chatRoomName,
      chatRoom_ID: chatRoomID,
      createdAt: serverTimestamp(),
      creator_ID: "ADMIN_User",
      isPrivate,
      roomPassword: hashedPassword,
      lastMessage: {
        createdAt: serverTimestamp(),
        message_id: "welcomeCRA",
        sender_ID: "ADMIN_User",
        text: `Welcome to ${chatRoomName}! 🎉`,
      },
      members: ["ADMIN_User"],
    });
  } catch (error) {
    console.error("❌ Error creating chat room:", error);
    throw error;
  }
};

export const getAllChatRooms = async () => {
  try {
    const q = query(collection(db, "ChatRooms"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("❌ Error fetching all chat rooms:", error);
    throw error;
  }
};

export const getUserChatRooms = async (user_ID) => {
  try {
    const userSnap = await getDoc(doc(db, "Users", user_ID));
    if (!userSnap.exists()) return [];
    return userSnap.data().chatRoomsJoined || [];
  } catch (error) {
    console.error("❌ Error fetching user chat rooms:", error);
    throw error;
  }
};

export const joinChatRoom = async (
  user_ID,
  chatRoom_ID,
  inputPassword = null
) => {
  try {
    if (!user_ID || !chatRoom_ID) {
      throw new Error("Missing user_ID or chatRoom_ID");
    }

    const userRef = doc(db, "Users", user_ID);
    const chatRoomRef = doc(db, "ChatRooms", chatRoom_ID);

    const roomSnap = await getDoc(chatRoomRef);
    if (!roomSnap.exists()) throw new Error("Room does not exist.");

    const roomData = roomSnap.data();
    const { isPrivate, roomPassword, members = [] } = roomData;

    if (isPrivate) {
      if (!inputPassword) throw new Error("Password is required.");
      const hashedInput = await hashPassword(inputPassword);
      if (hashedInput !== roomPassword) throw new Error("Incorrect password.");
    }

    if (!members.includes(user_ID)) {
      await updateDoc(chatRoomRef, { members: arrayUnion(user_ID) });
    }

    await updateDoc(userRef, { chatRoomsJoined: arrayUnion(chatRoom_ID) });
  } catch (error) {
    console.error("❌ Error joining chat room:", error);
    throw error;
  }
};
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
    console.error("❌ Error getting messages:", error);
    throw error;
  }
};

export const sendMessage = async (chatRoom_ID, sender, text) => {
  try {
    if (!sender || !sender._id)
      throw new Error("Sender information is missing");

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
    console.error("❌ Error sending message:", error);
    throw error;
  }
};

export const likeMessage = async (chatRoom_ID, message_ID, user_ID) => {
  try {
    const msgRef = doc(db, `ChatRooms/${chatRoom_ID}/Messages`, message_ID);
    await updateDoc(msgRef, {
      likedBy: arrayUnion(user_ID),
    });
  } catch (error) {
    console.error("❌ Error liking message:", error);
    throw error;
  }
};

export const replyToMessage = async (
  chatRoom_ID,
  message_ID,
  sender,
  replyText
) => {
  try {
    if (!sender || !sender._id)
      throw new Error("Sender information is missing");

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
    console.error("❌ Error replying to message:", error);
    throw error;
  }
};
