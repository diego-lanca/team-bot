// Envio de mensagens e validações

import { Twilio } from "twilio";
import { env } from "../config/env";

const client = new Twilio(env.TWILIO_SID, env.TWILIO_AUTH);

export async function sendMessage(to: string, body: string): Promise<void> {
  await client.messages.create({
    from: env.TWILIO_FROM,
    to,
    body,
  });
}
