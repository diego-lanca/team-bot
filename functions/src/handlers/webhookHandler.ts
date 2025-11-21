import { route } from "../bot/router";
import { onRequest } from "firebase-functions/v2/https";
import { fetchUser, getUsersWithTermsAndTrain } from "../services/userService";
import { onSchedule } from "firebase-functions/scheduler";
import { sendMessage } from "../services/twilioService";
import PromisePool from "@supercharge/promise-pool";
import { setSession, upsertSubscription } from "../services/firestoreService";
import { generateDayMotivation } from "../services/openAiService";
import * as crypto from "crypto";
import { Timestamp } from "firebase-admin/firestore";
import { KiwifyOrder } from "../models/kiwifyOrder";
import { env } from "../config/env";

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
    schedule: "every day 08:00",
    timeZone: "America/Sao_Paulo",
  },
  async () => {
    console.log("🚀 Iniciando rotina diária de motivação...");

    const start = Date.now();
    const dateFormatted = new Intl.DateTimeFormat("pt-BR").format(start);

    const users = await getUsersWithTermsAndTrain();
    const dayMotivation = await generateDayMotivation();

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
            "HX63dcb4410b94d52674935c168cd0f460",
            "",
            `{"1":"${user.name}","2":"${dateFormatted}","3":"${dayMotivation}"}`
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

export const updateSubscription = onRequest(
  { timeoutSeconds: 1200, region: "southamerica-east1" },
  async (req, res): Promise<void> => {
    const startTime = Date.now();
    console.log("📩 Received request to update subscription");
    console.log(req.body);

    // webhook testing
    if (req.body.event == "ping") {
      res.status(200).send("pong!");
      return;
    }

    if (req.method !== "POST") {
      console.warn("❌ Invalid method:", req.method);
      res.status(405).send("Only POST allowed");
      return;
    }

    const { signature } = req.query;
    const calculatedSignature = crypto
      .createHmac("sha1", env.KIWIFY_SECRET)
      .update(JSON.stringify(req.body))
      .digest("hex");
    if (signature !== calculatedSignature) {
      res.status(400).send({ error: "Incorrect signature" });
      return;
    }

    try {
      const order = req.body as KiwifyOrder;
      const event = order.webhook_event_type;
      const customerPhone = order.Customer.mobile;

      const formattedPhone = "whatsapp:" + customerPhone;

      console.log("👤 Processing order:", {
        orderId: order.order_id,
        event,
        formattedPhone,
      });

      if (
        event !== "subscription_canceled" &&
        event !== "subscription_renewed" &&
        event !== "subscription_late" &&
        event !== "order_refunded" &&
        event !== "order_approved"
      ) {
        res.status(400).send("Event not allowed.");
        return;
      }

      const user = await fetchUser(formattedPhone);
      console.log("✅ User fetched successfully:", { userId: user.id });

      const nextDueDate = new Date(order.Subscription.next_payment);
      const nextDue = Timestamp.fromDate(nextDueDate);

      const currentDueDate = new Date(order.Subscription.start_date);
      const currentDue = Timestamp.fromDate(currentDueDate);

      const orderStatus = order.order_status;

      let newStatus: "active" | "past_due" | "canceled" | undefined = "active";

      newStatus =
        orderStatus === 'paid'
          ? "active"
          : "past_due";

      // ────────────────────────────────
      // EVENT: order CREATED
      // ────────────────────────────────
      if (event === "order_approved") {
        console.log("🆕 Handling new order creation event");

        await upsertSubscription(user.id, {
          userId: user.id,
          contractId: order.subscription_id,
          status: newStatus,
          lastPaymentAt: currentDue,
          nextDueDate: nextDue,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });

        console.log("✅ New subscription created:", {
          userId: user.id,
          nextDue: nextDueDate.toISOString(),
        });

        res
          .status(200)
          .send(
            `✅ New subscription created\nPhone: ${formattedPhone}` +
              "\nUserId: ${user.id}"
          );
        return;
      }

      // ────────────────────────────────
      // EVENT: order UPDATED
      // ────────────────────────────────
      console.log("🔄 Updating subscription for order:", {
        orderId: order.subscription_id,
        orderStatus,
      });

      if (
        event !== "subscription_renewed"
      ) {
        newStatus =
          event === "subscription_late"
            ? "past_due"
            : "canceled";

        console.warn("⚠️ order not in good standing, updating status:", {
          orderId: order.subscription_id,
          newStatus,
        });
      }

      await upsertSubscription(user.id, {
        updatedAt: Timestamp.now(),
        lastPaymentAt: currentDue,
        nextDueDate: nextDue,
        status: newStatus,
      });

      console.log("✅ Subscription updated successfully:", {
        userId: user.id,
        status: newStatus,
      });

      res
        .status(200)
        .send(`Subscription updated\nUserId: ${user.id}\nStatus: ${newStatus}`);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("🔥 Error updating subscription:", {
        message: error.message,
        stack: error.stack,
      });

      res.status(500).send("Internal Server Error: " + error.message);
    } finally {
      console.log(
        "⏱️ Request finished in",
        (Date.now() - startTime).toFixed(0),
        "ms"
      );
    }
  }
);
