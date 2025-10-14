import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { Session } from "../models/session";
import { Subscription } from "../models/subscription";
// import * as admin from "firebase-admin";

const db = getFirestore();
const sessionsRef = db.collection("sessions");
const subRef = db.collection("subscriptions");
// const bucket = admin.storage().bucket();

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

export async function upsertSubscription(
  userId: string,
  data: Subscription
): Promise<void> {
  const userSub = subRef.doc(userId);

  const payload = {
    ...data,
    updatedAt: Timestamp.fromDate(new Date()),
  };
  await userSub.set(payload, { merge: true });
}

export async function getSubscription(
  userId: string
): Promise<Subscription | null> {
  const doc = await subRef.doc(userId).get();
  return doc.exists ? (doc.data() as Subscription) : null;
}

// async function saveSessionAudio(
//   userId: string,
//   filename: string,
//   buffer: Buffer
// ): Promise<string> {
//   // Cria um "caminho" dentro do bucket
//   const path = `sessions/${userId}/${filename}`;
//   const file = bucket.file(path);

//   await file.save(buffer, { contentType: "audio/ogg" });

//   const [url] = await file.getSignedUrl({
//     action: "read",
//     expires: Date.now() + 1000 * 60 * 60, // 1 hora
//   });

//   return url;
// }
