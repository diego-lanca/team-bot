// import { sendMessage } from "../services/twilioService";
import { route } from "../bot/router";
import { onRequest } from "firebase-functions/v2/https";
import { fetchUser, getUsersWithTermsAndTrain } from "../services/userService";
import { onSchedule } from "firebase-functions/scheduler";
import { sendMessage } from "../services/twilioService";
import PromisePool from "@supercharge/promise-pool";
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

      await sendMessage(userPhone, reply.msg, reply.mediaUrl);

      res.status(200).send(reply);
    } catch (err) {
      console.error("Error processing message:", err);
      await sendMessage(
        userPhone,
        "Oops! Ocorreu um erro ao processar a mensagem, " + "tente novamente."
      );
      res.status(500).send("Internal Server Error: " + err);
    }
  }
);

// export const testSendDayMotivation = onRequest(
//   { timeoutSeconds: 1200, region: "southamerica-east1" },
//   async (req, res) => {
//     console.log("🚀 Iniciando rotina diária de motivação...");

//     const start = Date.now();
//     const dateFormatted = new Intl.DateTimeFormat("pt-BR").format(start);

//     const users = await getUsersWithTermsAndTrain();

//     console.log(
//       `📋 ${users.length} usuários com treinos e termos aceitos encontrados.`
//     );

//     const { results, errors } = await PromisePool.withConcurrency(3)
//       .for(users)
//       .process(async (user) => {
//         const userLog = {
//           id: user.id,
//           phone: user.phone,
//           chooseTrainOnDayMotivation: user.chooseTrainOnDayMotivation,
//         };

//         console.log("➡️ Iniciando envio para usuário:", userLog);
//         try {
//           await setSession(user.id, { step: "confirm_daily_motivation" });

//           await sendMessage(
//             user.phone,
//             "HX6e37ac0dc8ee468f5d91af5bbaa889b8",
//             "",
//             // eslint-disable-next-line max-len
//             `{"1":"${user.name}","2":"${dateFormatted}"}`
//           );

//           console.log(`✅ Mensagem enviada com sucesso para ${user.phone}`);
//         } catch (err: unknown) {
//           console.error(`❌ Erro ao enviar para ${user.phone}:`, err);

//           throw new Error(`[${user.phone}] ${err}`);
//         }
//       });

//     const end = Date.now();
//     console.log("📊 Rotina finalizada.");
//     console.log(`⏱️ Tempo total: ${(end - start) / 1000}s`);
//     console.log(`✅ Enviados: ${results.length}`);
//     console.log(`❌ Falharam: ${errors.length}`);

//     if (errors.length > 0) {
//       console.error("🧾 Detalhes dos erros:");
//       errors.forEach((err: unknown) => console.error(err));
//     }

//     console.log("🏁 Day motivation sended.");

//     res.status(200).send('done');
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
    const dateFormatted = new Intl.DateTimeFormat("pt-BR").format(start);

    const users = await getUsersWithTermsAndTrain();

    console.log(
      `📋 ${users.length} usuários com treinos e termos aceitos encontrados.`
    );

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
          await sendMessage(
            user.phone,
            "HX6e37ac0dc8ee468f5d91af5bbaa889b8",
            "",
            `{"1":"${user.name}","2":"${dateFormatted}"}`
          );

          await setSession(user.id, { step: "confirm_daily_motivation" });
          console.log(`✅ Mensagem enviada com sucesso para ${user.phone}`);
        } catch (err: unknown) {
          console.error(`❌ Erro ao enviar para ${user.phone}:`, err);

          throw new Error(`[${user.phone}] ${err}`);
        }
      });

    const end = Date.now();
    console.log("📊 Rotina finalizada.");
    console.log(`⏱️ Tempo total: ${(end - start) / 1000}s`);
    console.log(`✅ Enviados: ${results.length}`);
    console.log(`❌ Falharam: ${errors.length}`);

    if (errors.length > 0) {
      console.error("🧾 Detalhes dos erros:");
      errors.forEach((err: unknown) => console.error(err));
    }

    console.log("🏁 Day motivation sended.");
  }
);
