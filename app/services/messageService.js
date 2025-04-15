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

const MESSAGES_COLLECTION = "Messages";
const USERS_COLLECTION = "Users";

// Send a new message
export const sendMessage = async (message, user) => {
  const userData = {
    _id: user._id,
    name: user.name,
    email: user.email || null,
    avatar: user.avatar || null,
  };

  const messageRef = await addDoc(collection(db, MESSAGES_COLLECTION), {
    _id: message._id,
    text: message.text || "",
    image: message.image || null,
    location: message.location || null,
    createdAt: serverTimestamp(),
    user: userData,
    likedBy: [],
  });

  const userRef = doc(db, USERS_COLLECTION, user._id);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) {
    await setDoc(userRef, {
      messages: [messageRef.id],
      ...userData,
      createdAt: serverTimestamp(),
    });
  } else {
    await updateDoc(userRef, {
      messages: arrayUnion(messageRef.id),
    });
  }

  return messageRef.id;
};

// Reply to a message
export const replyToMessage = async (messageID, replyText, user) => {
  const reply = {
    text: replyText,
    createdAt: serverTimestamp(),
    user,
  };

  const repliesRef = collection(
    db,
    `${MESSAGES_COLLECTION}/${messageID}/Replies`
  );

  const replyDoc = await addDoc(repliesRef, reply);
  return replyDoc.id;
};

// Toggle Reaction on a message (like/unlike)
export const toggleReaction = async (messageID, userID, emoji) => {
  const msgRef = doc(db, MESSAGES_COLLECTION, messageID);
  const msgSnap = await getDoc(msgRef);

  if (!msgSnap.exists()) return;

  const likedBy = msgSnap.data().likedBy || [];

  const updateData = likedBy.includes(emoji)
    ? { likedBy: arrayRemove(emoji) }
    : { likedBy: arrayUnion(emoji) };

  await updateDoc(msgRef, updateData);
};

// Real-time listener with replies and reactions
export const listenToMessages = (onMessagesUpdate) => {
  const q = query(
    collection(db, MESSAGES_COLLECTION),
    orderBy("createdAt", "desc")
  );

  return onSnapshot(q, async (snapshot) => {
    const messages = await Promise.all(
      snapshot.docs.map(async (docSnap) => {
        const data = docSnap.data();

        const repliesSnap = await getDocs(
          collection(db, `${MESSAGES_COLLECTION}/${docSnap.id}/Replies`)
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

    await AsyncStorage.setItem("cachedMessages", JSON.stringify(messages));
    onMessagesUpdate(messages);
  });
};
