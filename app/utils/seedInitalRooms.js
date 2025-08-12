import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../services/firebase";
import adminUser from "../../config/adminUser";

// Initial Rooms Data (updated)
const rooms = [
  {
    chatRoom_ID: "CharlieRomeoAlpha",
    chatRoomName: "Chat Room Alpha",
    lastMessage: {
      welcomeMessage: {
        message_id: "welcomeCRA",
        sender_ID: adminUser.userID,
        text: "Welcome to Chat Room Alpha! 🎉",
      },
    },
  },
  {
    chatRoom_ID: "CharlieRomeoBravo",
    chatRoomName: "Chat Room Bravo",
    lastMessage: {
      welcomeMessage: {
        message_id: "welcomeCRB",
        sender_ID: adminUser.userID,
        text: "Welcome to Chat Room Bravo! 💬",
      },
    },
  },
  {
    chatRoom_ID: "CharlieRomeoCharlie",
    chatRoomName: "Chat Room Charlie",
    lastMessage: {
      welcomeMessage: {
        message_id: "welcomeCRC",
        sender_ID: adminUser.userID,
        text: "Welcome to Chat Room Charlie! 🚀",
      },
    },
  },
];

export const seedInitialRooms = async () => {
  try {
    for (const room of rooms) {
      const roomRef = doc(db, "ChatRooms", room.chatRoom_ID);
      const snapshot = await getDoc(roomRef);

      if (!snapshot.exists()) {
        await setDoc(roomRef, {
          chatRoom_ID: room.chatRoom_ID,
          chatRoomName: room.chatRoomName,
          isPrivate: false,
          createdAt: serverTimestamp(),
          creator_ID: adminUser.userID,
          members: [adminUser.userID],
          lastMessage: room.lastMessage,
        });
        console.log(`✅ Room Created: ${room.chatRoomName}`);
      } else {
        console.log(`⚠️ Room Already Exists: ${room.chatRoomName}`);
      }
    }
  } catch (error) {
    console.error("❌ Error Seeding Rooms:", error);
  }
};
