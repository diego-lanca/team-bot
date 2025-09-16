import { sendMessage } from "../services/twilioService";
import { route } from "../bot/router";
import { onRequest } from "firebase-functions/https";

// Função webhook
exports.webhook = onRequest(
  { timeoutSeconds: 1200 },
  async (req, res): Promise<void> => {
    if (req.method !== "POST") {
      res.status(405).send("Only POST");
      return;
    }

    const userMessage = (req.body.Body ?? "") as string;
    const from = (req.body.From ?? "") as string;

    const reply = await route(userMessage);
    await sendMessage(from, reply);

    res.status(200).end();
  }
);
