import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { Session } from "../models/session";

const db = getFirestore();
const sessionsRef = db.collection("sessions");

export async function getSession(userId: string): Promise<Session | null> {
  const snapshot = await sessionsRef
    .where("userId", "==", userId)
    .limit(1)
    .get();

  if (snapshot.empty) return null;
  return snapshot.docs[0].data() as Session;
}

export async function setSession(
  userId: string,
  session: Partial<Session>
): Promise<void> {
  await sessionsRef.doc(userId).set(
    {
      ...session,
      updatedAt: Timestamp.now(),
    },
    { merge: true }
  );
}
