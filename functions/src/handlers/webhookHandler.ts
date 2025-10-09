// import { sendMessage } from "../services/twilioService";
import { route } from "../bot/router";
import { onRequest } from "firebase-functions/v2/https";
import { fetchUser, getUsersWithTermsAccepted } from "../services/userService";
import { onSchedule } from "firebase-functions/scheduler";
import { generateDayMotivation } from "../services/openAiService";
import { UserDoc } from "../models/user";
import { sendMessage } from "../services/twilioService";
import PromisePool from "@supercharge/promise-pool";
import {
  getUserTraining,
  getUserTrainings,
} from "../services/trainingPlanService";
import { getUserTodayTrain } from "./trainingMenuHandler";
import { setSession } from "../services/firestoreService";
// import { sendMessage } from "../services/twilioService";

// Função onMessage
export const onMessage = onRequest(
  { timeoutSeconds: 1200, region: "southamerica-east1" },
  async (req, res): Promise<void> => {
    if (req.method !== "POST") {
      console.log("Invalid method:", req.method);
      res.status(405).send("Only POST");
      return;
    }

    console.log("Incoming req: " + req.body);

    const { Body, MediaUrl0, MediaContentType0, From } = req.body;

    const userMessage = (Body ?? "") as string;
    const userPhone = (From ?? "") as string;

    try {
      const user = await fetchUser(userPhone);

      const reply = await route(
        user,
        userMessage,
        MediaUrl0,
        MediaContentType0
      );

      // await sendMessage(userPhone, reply);

      res.status(200).send(reply);
    } catch (err) {
      console.error("Error processing message:", err);
      res.status(500).send("Internal Server Error");
    }
  }
);

export const testSendDayMotivation = onRequest(
  { timeoutSeconds: 1200, region: "southamerica-east1" },
  async () => {
    const dayMotivation: string = await generateDayMotivation();

    const users: UserDoc[] = await getUsersWithTermsAccepted();

    await PromisePool.withConcurrency(3)
      .for(users)
      .process(async (user) => {
        let message = dayMotivation + "\n";

        const training = await getUserTraining(user.id);

        if (!training) await setSession(user.id, { step: "main_menu" });

        if (training) {
          if (!user.chooseTrainOnDayMotivation) {
            message += getUserTodayTrain(training);
            await setSession(user.id, { step: "main_menu" });
          } else {
            message += await getUserTrainings(user);
            await setSession(user.id, { step: "select_daily_training" });
          }
        }

        await sendMessage(user.phone, message);
      });

    console.log("Day motivation sended");
  }
);

export const generateAndSendDayMotivation = onSchedule(
  {
    region: "southamerica-east1",
    schedule: "every day 06:00",
    timeZone: "America/Sao_Paulo",
  },
  async () => {
    const dayMotivation: string = await generateDayMotivation();

    const users: UserDoc[] = await getUsersWithTermsAccepted();

    await PromisePool.withConcurrency(3)
      .for(users)
      .process(async (user) => {
        let message = dayMotivation + "\n";

        const training = await getUserTraining(user.id);
        if (training) {
          if (!user.chooseTrainOnDayMotivation) {
            message += getUserTodayTrain(training);
            await setSession(user.id, { step: "main_menu" });
          } else {
            message += await getUserTrainings(user);
            await setSession(user.id, { step: "select_daily_training" });
          }
        }

        await sendMessage(user.phone, message);
      });

    console.log("Day motivation sended");
  }
);
