// import { sendMessage } from "../services/twilioService";
import { route } from "../bot/router";
import { onRequest } from "firebase-functions/v2/https";
import {
  fetchUser,
  getUserHourTraining,
  getUsersWithTermsAccepted,
} from "../services/userService";
import { onSchedule } from "firebase-functions/scheduler";
import { generateDayMotivation } from "../services/openAiService";
import { scheduleMessage, sendMessage } from "../services/twilioService";
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

      await sendMessage(userPhone, reply);

      res.status(200).send(reply);
    } catch (err) {
      console.error("Error processing message:", err);
      res.status(500).send("Internal Server Error");
    }
  }
);

// export const testSendDayMotivation = onRequest(
//   { timeoutSeconds: 1200, region: "southamerica-east1" },
//   async (req, res) => {
//     const dayMotivation: string = await generateDayMotivation();

//     const users: UserDoc[] = await getUsersWithTermsAccepted();

//     console.log(users.length);

//     await PromisePool.withConcurrency(3)
//       .for(users)
//       .process(async (user) => {
//         let message = dayMotivation + "\n";

//         const training = await getUserTraining(user.id);
//         if (training) {
//           let trainingText = "";
//           if (!user.chooseTrainOnDayMotivation) {
//             trainingText += getUserTodayTrain(training);
//             await scheduleMessage(
//               user.phone,
//               "💪 Bora pro treino de hoje!\n" +
//                 "Nada de deixar pra depois — seu corpo e sua mente vão " +
//                 "te agradecer depois.\n🔥 Só depende de você!" +
//                 trainingText,
//               getUserHourTraining(user)
//             );
//             await setSession(user.id, { step: "main_menu" });
//           } else {
//             trainingText += await getUserTrainings(user);
//             await setSession(user.id, { step: "select_daily_training" });
//           }

//           message += trainingText;
//           console.log(message);
//           console.log(user.name);
//         }

//         await sendMessage(user.phone, message);
//       });

//     console.log("Day motivation sended");
//     res.status(200).send();
//   }
// );

export const generateAndSendDayMotivation = onSchedule(
  {
    region: "southamerica-east1",
    schedule: "every day 06:00",
    timeZone: "America/Sao_Paulo",
  },
  async () => {
    console.log("🚀 Iniciando rotina diária de motivação...");

    const start = Date.now();
    const dayMotivation = await generateDayMotivation();
    const users = await getUsersWithTermsAccepted();

    console.log(`📋 ${users.length} usuários com termos aceitos encontrados.`);

    const { results, errors } = await PromisePool.withConcurrency(3)
      .for(users)
      .process(async (user) => {
        const userLog = {
          id: user.id,
          phone: user.phone,
          chooseTrainOnDayMotivation: user.chooseTrainOnDayMotivation,
        };

        console.log("➡️ Iniciando envio para usuário:", userLog);

        try {
          let message = dayMotivation + "\n";
          const training = await getUserTraining(user.id);

          if (training) {
            if (!user.chooseTrainOnDayMotivation) {
              const trainingText = getUserTodayTrain(training);
              const hour = getUserHourTraining(user);

              console.log(
                `🏋️ Enviando treino automático para ${user.phone} (${hour})`
              );

              await scheduleMessage(
                user.phone,
                "💪 Bora pro treino de hoje!\n" +
                  "Nada de deixar pra depois — seu corpo e sua mente vão " +
                  "te agradecer depois.\n🔥 Só depende de você!" +
                  trainingText,
                hour
              );

              await setSession(user.id, { step: "main_menu" });
              message += trainingText;
            } else {
              console.log(
                `📖 Usuário ${user.phone} prefere escolher treino manualmente.`
              );
              const trainingOptions = await getUserTrainings(user);
              await setSession(user.id, { step: "select_daily_training" });
              message += trainingOptions;
            }
          } else {
            console.warn(
              `⚠️ Nenhum treino encontrado para usuário ${user.phone}`
            );
          }

          await sendMessage(user.phone, message);
          console.log(`✅ Mensagem enviada com sucesso para ${user.phone}`);
          return { userId: user.id, success: true };
        } catch (err: unknown) {
          console.error(`❌ Erro ao enviar para ${user.phone}:`, err);
          return {
            userId: user.id,
            success: false,
            error: err instanceof Error ? err.message : String(err),
          };
        }
      });

    const end = Date.now();
    console.log("📊 Rotina finalizada.");
    console.log(`⏱️ Tempo total: ${(end - start) / 1000}s`);
    console.log(`✅ Enviados: ${results.filter((r) => r.success).length}`);
    console.log(`❌ Falharam: ${errors.length}`);

    if (errors.length > 0) {
      console.error("🧾 Detalhes dos erros:");
      errors.forEach((err: unknown) => console.error(err));
    }

    console.log("🏁 Day motivation sended.");
  }
);
