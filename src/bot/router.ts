// Roteamento de mensagens

import { greetings } from "./flows/greetings";

export async function route(msg: string): Promise<string> {
  if (msg.includes('oi') || msg.includes('olá')) return greetings();

  return 'Desculpa, não entendi. Digite "ajuda" para opções.';
}
