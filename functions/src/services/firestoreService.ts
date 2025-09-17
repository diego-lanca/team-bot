import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { Session } from "../models/session";

export async function getSession(userId: string): Promise<Session | null> {
  // Obtenha a instância do Firestore e a referência da coleção
  const db = getFirestore();
  const sessionsRef = db.collection("sessions");

  const doc = await sessionsRef.doc(userId).get();
  return doc.exists ? (doc.data() as Session) : null;
}

export async function setSession(
  userId: string,
  session: Partial<Session>
): Promise<void> {
  const db = getFirestore();
  const sessionsRef = db.collection("sessions");

  await sessionsRef.doc(userId).set(
    {
      ...session,
      updatedAt: Timestamp.now(),
    },
    { merge: true }
  );
}
