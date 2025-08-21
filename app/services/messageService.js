import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  getDoc,
  getDocs,
  setDoc,
  query,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { db } from "./firebase";

// Send a new message
export const sendMessage = async (message, user, chatRoom_ID) => {
  if (!chatRoom_ID) throw new Error("Missing chatRoom_ID");

  const userData = {
    _id: user._id,
    name: user.name,
    email: user.email || null,
    avatar: user.avatar || null,
  };

  const messageData = {
    _id: message._id,
    text: message.text || "",
    image: message.image || null,
    location: message.location || null,
    createdAt: serverTimestamp(),
    user: userData,
    likedBy: [],
  };

  const messageRef = await addDoc(
    collection(db, `ChatRooms/${chatRoom_ID}/Messages`),
    messageData
  );

  // Track user messages
  const userRef = doc(db, "Users", user._id);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      ...userData,
      messages: [messageRef.id],
      createdAt: serverTimestamp(),
    });
  } else {
    await updateDoc(userRef, {
      messages: arrayUnion({
        messageID: messageRef.id,
        text: message.text || "",
        sentAt: new Date(),
        chatRoom_ID,
        hasImage: !!message.image,
        hasLocation: !!message.location,
      }),
    });
  }

  return messageRef.id;
};

// Reply to a message
export const replyToMessage = async (
  chatRoom_ID,
  messageID,
  replyText,
  user
) => {
  const reply = {
    text: replyText,
    sentAt: new Date(),
    user,
  };

  const repliesRef = collection(
    db,
    `ChatRooms/${chatRoom_ID}/Messages/${messageID}/Replies`
  );

  const replyDoc = await addDoc(repliesRef, reply);
  return replyDoc.id;
};

// Toggle Reaction on a message (like/unlike)
export const toggleReaction = async (chatRoom_ID, messageID, userID, emoji) => {
  const msgRef = doc(db, `ChatRooms/${chatRoom_ID}/Messages`, messageID);
  const msgSnap = await getDoc(msgRef);

  if (!msgSnap.exists()) return;

  const likedBy = msgSnap.data().likedBy || [];

  const updateData = likedBy.includes(emoji)
    ? { likedBy: arrayRemove(emoji) }
    : { likedBy: arrayUnion(emoji) };

  await updateDoc(msgRef, updateData);
};

// Real-time listener with replies and reactions
export const listenToMessages = (chatRoom_ID, onMessagesUpdate) => {
  const q = query(
    collection(db, `ChatRooms/${chatRoom_ID}/Messages`),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, async (snapshot) => {
    const messages = await Promise.all(
      snapshot.docs.map(async (docSnap) => {
        const data = docSnap.data();

        const repliesSnap = await getDocs(
          collection(
            db,
            `ChatRooms/${chatRoom_ID}/Messages/${docSnap.id}/Replies`
          )
        );

        return {
          _id: docSnap.id,
          text: data.text || "",
          createdAt: data.createdAt?.toDate() || new Date(),
          user: data.user,
          image: data.image || null,
          location: data.location || null,
          likedBy: data.likedBy || [],
          replies: repliesSnap.docs.map((r) => ({ _id: r.id, ...r.data() })),
        };
      })
    );

    // Cache locally
    await AsyncStorage.setItem("cachedMessages", JSON.stringify(messages));
    onMessagesUpdate(messages);
  });
};
