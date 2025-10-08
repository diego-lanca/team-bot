import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { Session } from "../models/session";
// import * as admin from "firebase-admin";

const db = getFirestore();
const sessionsRef = db.collection("sessions");
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
