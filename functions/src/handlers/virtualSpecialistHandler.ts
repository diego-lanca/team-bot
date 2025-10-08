import { Timestamp } from "firebase-admin/firestore";
import { ChatSession } from "../models/chatSession";
import { UserDoc } from "../models/user";
import { getUserChat, setChatSession } from "../services/chatService";
import {
  chatWithVirtualSpecialist,
  getUserMessage,
} from "../services/openAiService";

export async function virtualSpecialistChat(
  user: UserDoc,
  msg: string,
  media?: string,
  contentType?: string
): Promise<string> {
  const savedChat = await getUserChat(user.id);

  const chatSession: ChatSession = savedChat.chatSession || {
    userId: user.id,
    finished: false,
    chatHistoric: [],
  };

  const message = await getUserMessage(
    sanitizeMessage(msg),
    media,
    contentType
  );

  const response = await chatWithVirtualSpecialist(user, message, chatSession);

  chatSession.chatHistoric.push(
    {
      role: "user",
      content: message,
      format: "audio",
      timestamp: Timestamp.now(),
    },
    {
      role: "assistant",
      content: response,
      format: "text",
      timestamp: Timestamp.now(),
    }
  );

  await setChatSession(chatSession, savedChat.docId ?? undefined);

  return response;
}

function sanitizeMessage(msg: string): string {
  return msg
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}
