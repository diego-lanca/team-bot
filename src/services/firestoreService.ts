import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { Session } from "../models/session";

const db = getFirestore();

const sessionsRef = db.collection("sessions");

export async function getSession(userId: string): Promise<Session | null> {
  const doc = await sessionsRef.doc(userId).get();
  return doc.exists ? (doc.data() as Session) : null;
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
