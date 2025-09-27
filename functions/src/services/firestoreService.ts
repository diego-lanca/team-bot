import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { Session } from "../models/session";

const db = getFirestore();
const sessionsRef = db.collection("sessions");

export async function getSession(userId: string): Promise<Session | null> {
  // Busca o documento diretamente pelo seu ID (a "etiqueta da gaveta")
  const docRef = sessionsRef.doc(userId);
  const docSnap = await docRef.get();

  // Se existir, retorna os dados do documento
  return docSnap.data() as Session;
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
