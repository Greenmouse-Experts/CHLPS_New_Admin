import { UserState } from "../../features/auth/reducers/user_slice";
import { openDB } from "idb";

const DB_NAME = "secureUserDB";
const STORE_NAME = "users";

export const getDB = async () => {
  if (typeof window === "undefined") {
    throw new Error("IndexedDB is not available in this environment.");
  }

  return await openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "userId" });
      }
    },
  });
};

export const saveUserToDB = async (updatedFields: Partial<UserState>) => {
  const db = await getDB();
  const existingUsers = await db.getAll(STORE_NAME);

  // On a new login (userId provided), purge stale records from other sessions
  // so getUserFromDB()[0] always returns the current user.
  if (updatedFields.userId) {
    for (const u of existingUsers) {
      if (u.userId && u.userId !== updatedFields.userId) {
        await db.delete(STORE_NAME, u.userId);
      }
    }
  }

  const existingUser =
    existingUsers.find((u) => u.userId === updatedFields.userId) ??
    existingUsers[0] ??
    {};

  const mergedUser: UserState = {
    ...existingUser,
    ...updatedFields,
  };

  await db.put(STORE_NAME, mergedUser);
};

export const getUserFromDB = async () => {
  try {
    const db = await getDB();
    return await db.getAll(STORE_NAME);
  } catch (error) {
    console.error("Error accessing IndexedDB:", error);
    return [];
  }
};
