// import { sendMessage } from "../services/twilioService";
import { route } from "../bot/router";
import { onRequest } from "firebase-functions/v2/https";
import { fetchUser, getUsersWithTermsAccepted } from "../services/userService";
import { onSchedule } from "firebase-functions/scheduler";
import { generateDayMotivation } from "../services/openAiService";
import { UserDoc } from "../models/user";
import { sendMessage } from "../services/twilioService";
import PromisePool from "@supercharge/promise-pool";
// import { sendMessage } from "../services/twilioService";

// Função onMessage
export const onMessage = onRequest(
  { timeoutSeconds: 1200 },
  async (req, res): Promise<void> => {
    if (req.method !== "POST") {
      res.status(405).send("Only POST");
      return;
    }

    const userMessage = (req.body.Body ?? "") as string;
    const userPhone = (req.body.From ?? "") as string;

    const user = await fetchUser(userPhone);

    const reply = await route(user, userMessage);
    // await sendMessage(userPhone, reply);

    res.status(200).send(reply);
  }
);

export const generateAndSendDayMotivation = onSchedule(
  "every day 06:00",
  async () => {
    const dayMotivation: string = await generateDayMotivation();

    const users: UserDoc[] = await getUsersWithTermsAccepted();

    await PromisePool.withConcurrency(3)
      .for(users)
      .process(async (user) => {
        await sendMessage(user.phone, dayMotivation);
      });

    console.log("Day motivation sended");
  }
);
