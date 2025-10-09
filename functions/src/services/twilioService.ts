// Envio de mensagens e validações

import { Twilio } from "twilio";
import { env } from "../config/env";

const client = new Twilio(env.TWILIO_SID, env.TWILIO_AUTH);

export async function sendMessage(to: string, body: string): Promise<void> {
  const contentSidMapping: Record<string, boolean> = {
    HX7ee867afe41d6ad43796d4645744f412: true,
  };

  // Verifica se o body corresponde a alguma chave do contentSidMapping
  const hasContentSid = Object.prototype.hasOwnProperty.call(
    contentSidMapping,
    body
  );

  const message = hasContentSid
    ? {
      from: env.TWILIO_FROM,
      to,
      contentSid: body,
    }
    : {
      from: env.TWILIO_FROM,
      to,
      body,
    };

  await client.messages.create(message);
}

export async function scheduleMessage(
  to: string,
  body: string,
  date: Date
): Promise<void> {
  await client.messages.create({
    from: env.TWILIO_FROM,
    to,
    contentSid: body,
    scheduleType: "fixed",
    sendAt: date,
  });
}
