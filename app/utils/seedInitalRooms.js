import {
  collection,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../services/firebase";
import adminUser from "../config/adminUser";

// Initial Rooms Data
const rooms = [
  {
    id: "general",
    name: "General Chat",
    isPrivate: false,
  },
  {
    id: "sports",
    name: "Sports Talk",
    isPrivate: false,
  },
  {
    id: "music",
    name: "Music Lounge",
    isPrivate: false,
  },
];

export const seedInitialRooms = async () => {
  try {
    for (const room of rooms) {
      const roomRef = doc(db, "ChatRooms", room.id);
      const snapshot = await getDoc(roomRef);

      if (!snapshot.exists()) {
        await setDoc(roomRef, {
          name: room.name,
          isPrivate: room.isPrivate,
          createdAt: serverTimestamp(),
          creator_ID: adminUser.userID,
          members: [],
        });
        console.log(`✅ Room Created: ${room.name}`);
      } else {
        console.log(`⚠️ Room Already Exists: ${room.name}`);
      }
    }
  } catch (error) {
    console.error("❌ Error Seeding Rooms:", error);
  }
};
