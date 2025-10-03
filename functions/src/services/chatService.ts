import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { ChatSession } from "../models/chatSession";

const db = getFirestore();
const chatsRef = db.collection("chats");

const oneDayAgo = Timestamp.fromDate(
  new Date(Date.now() - 24 * 60 * 60 * 1000)
);

export async function getUserChat(
  userId: string
): Promise<{ chatSession: ChatSession | null; docId: string | null }> {
  const snapshot = await chatsRef
    .where("userId", "==", userId)
    .where("finished", "==", false)
    .limit(1)
    .get();

  if (snapshot.empty) return { chatSession: null, docId: null };

  const doc = snapshot.docs[0].data() as ChatSession;

  if (doc.lastMessage! <= oneDayAgo) {
    finishChat(snapshot.docs[0].id);
    return { chatSession: null, docId: null };
  }

  return {
    chatSession: snapshot.docs[0].data() as ChatSession,
    docId: snapshot.docs[0].id,
  };
}

export async function setChatSession(
  chat: Partial<ChatSession>,
  docId?: string
): Promise<void> {
  if (!docId) {
    await chatsRef.add({
      ...chat,
    } as ChatSession);

    return;
  }

  await chatsRef.doc(docId).set(chat, { merge: true });
}

export async function finishChat(id: string): Promise<void> {
  await chatsRef.doc(id).set(
    {
      finished: true,
    },
    { merge: true }
  );
}
