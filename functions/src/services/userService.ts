import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { UserDoc, User } from "../models/user";

const db = getFirestore();
const usersRef = db.collection("users");

export async function fetchUser(phone: string): Promise<UserDoc> {
  const user = await getUserByPhone(phone);
  if (user) return user;

  // Se não encontrar, cria um novo
  const docRef = await usersRef.add({
    phone,
    acceptedTerms: false,
    createdAt: Timestamp.now(),
    lastSeen: Timestamp.now(),
  });

  return {
    id: docRef.id,
    phone,
    acceptedTerms: false,
    createdAt: Timestamp.now(),
    lastSeen: Timestamp.now(),
  };
}

export async function getUsersWithTermsAccepted(): Promise<UserDoc[]> {
  const snapshot = await usersRef.where("acceptedTerms", "==", true).get();
  if (snapshot.empty) return [];

  const users = snapshot.docs.map((doc) => {
    return { id: doc.id, ...(doc.data() as User) };
  });

  return users;
}

export async function getUserByPhone(phone: string): Promise<UserDoc | null> {
  const snapshot = await usersRef.where("phone", "==", phone).limit(1).get();
  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];

  return { id: doc.id, ...(doc.data() as User) };
}

export async function setUser(
  userId: string,
  userData: Partial<User>
): Promise<void> {
  const user = {
    ...userData,
    lastSeen: Timestamp.now(),
  };

  await usersRef.doc(userId).set(user, { merge: true });
}

export function hasRequiredInfos(user: User): boolean {
  return (
    user.sex != undefined &&
    user.height != undefined &&
    user.weight != undefined &&
    user.age != undefined &&
    user.goal != undefined &&
    user.activityLevel != undefined
  );
}
