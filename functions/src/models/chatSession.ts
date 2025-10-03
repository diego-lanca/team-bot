import { Timestamp } from "firebase-admin/firestore";

export interface ChatSession {
  userId: string;
  chatHistoric: ChatMessage[];
  firstMessage?: Timestamp;
  lastMessage?: Timestamp;
  finished: boolean;
}

export interface ChatMessage {
  role: "user" | "assistant"; // quem enviou a mensagem
  content: string; // texto da mensagem
  timestamp: Timestamp; // opcional: unix timestamp da mensagem
}
