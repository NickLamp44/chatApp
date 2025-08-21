import {
  collection,
  doc,
  updateDoc,
  getDoc,
  query,
  orderBy,
  getDocs,
  setDoc,
  serverTimestamp,
  arrayUnion,
} from "firebase/firestore";
import { db } from "./firebase";
import { hashPassword } from "../utils/hashPassword";

/**
 * Create a new chat room
 */
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

/**
 * Fetch all chat rooms
 */
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

/**
 * Get rooms that a user has joined
 */
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

/**
 * Join a chat room (handles guests & password-protected rooms)
 */
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

    // Ensure user exists
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        userID: user_ID,
        chatRoomsJoined: [],
        createdAt: serverTimestamp(),
        isGuest: true,
      });
    }

    // Validate room
    const roomSnap = await getDoc(chatRoomRef);
    if (!roomSnap.exists()) throw new Error("Room does not exist.");

    const roomData = roomSnap.data();
    const { isPrivate, roomPassword, members = [] } = roomData;

    // Check password if private
    if (isPrivate) {
      if (!inputPassword) throw new Error("Password is required.");
      const hashedInput = await hashPassword(inputPassword);
      if (hashedInput !== roomPassword) throw new Error("Incorrect password.");
    }

    // Add user to members
    if (!members.includes(user_ID)) {
      await updateDoc(chatRoomRef, { members: arrayUnion(user_ID) });
    }

    // Track joined rooms in user doc
    await updateDoc(userRef, { chatRoomsJoined: arrayUnion(chatRoom_ID) });
  } catch (error) {
    console.error("❌ Error joining chat room:", error);
    throw error;
  }
};
