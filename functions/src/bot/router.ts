// Roteamento de mensagens
import { differenceInDays } from "date-fns";
import { UserDoc } from "../models/user";
import {
  getSession,
  getSubscription,
  setSession,
  upsertSubscription,
} from "../services/firestoreService";
import { welcome } from "./flows/introduction/welcome";
import {
  handleConfirmDailyMotivation,
  handleHomeTraining,
  handleMenu,
  handleProfileMenu,
  handleProTrainingMenu,
  handleSelectDailyHomeTraining,
  handleSelectDailyProTraining,
  handleSelectDailyTrainingType,
  handleTrainingMenu,
  handleVirtualSpecialistMenu,
} from "../handlers/stepHandler";
import { handleProfileOptions } from "../handlers/profileMenuHandler";
import { handleTrainingOptions } from "../handlers/proTrainingMenuHandler";
import { mainMenu } from "./flows/mainMenu";
import { handleIntrodutionOptions } from "../handlers/introdutionHandler";
import { env } from "../config/env";
import { Timestamp } from "firebase-admin/firestore";
import { handleHomeTrainingOptions } from "../handlers/homeTrainingHandler";

export const MAIN_MENU_GREETINGS = [
  "oi",
  "ola",
  "olá",
  "opa",
  "eai",
  "e aí",
  "bom dia",
  "boa tarde",
  "boa noite",
  "inicio",
  "menu principal",
  "start",
  "home",
  "comecar",
  "fala aí",
  "salve",
  "oii",
  "oie",
  "oiii",
  "ola!",
  "olá!",
  "opa!",
];

const normalize = (text: string): string =>
  text
    .toLowerCase()
    .normalize("NFD") // remove acentos
    .replace(/[\u0300-\u036f]/g, "")
    .trim();

export const isMainMenuGreeting = (msg: string): boolean => {
  const normalized = normalize(msg);
  return MAIN_MENU_GREETINGS.some((greet) => normalized === normalize(greet));
};

export async function route(
  user: UserDoc,
  msg: string,
  media?: string,
  contentType?: string
): Promise<{ msg: string; mediaUrl?: string }> {
  const subscription = await getSubscription(user.id);
  if (subscription === null) {
    await upsertSubscription(user.id, {
      userId: user.id,
      createdAt: Timestamp.fromDate(new Date()),
      status: "active",
      updatedAt: Timestamp.fromDate(new Date()),
    });
  } else {
    if (subscription.status !== "active") {
      return {
        msg:
          "⚠️ Olá! Seu plano não está ativo no momento, por isso o " +
          "bot está temporariamente indisponível. " +
          "Assim que o pagamento for confirmado, " +
          "tudo volta a funcionar normalmente 😊",
      };
    }
  }

  const session = await getSession(user.id);

  if (!session) {
    return { msg: await welcome(user) };
  }

  if (session.step !== "virtual_specialist_menu" && isMainMenuGreeting(msg)) {
    await setSession(user.id, { step: "main_menu" });
    return { msg: mainMenu(), mediaUrl: env.TEAMBOT_LOGO_URL };
  }

  const stepHandlers: Record<
    string,
    (
      user: UserDoc,
      msg: string,
      media?: string,
      contentType?: string
    ) => Promise<{ msg: string; mediaUrl?: string }>
  > = {
    ...handleIntrodutionOptions(),
    main_menu: handleMenu,
    profile_menu: handleProfileMenu,
    training_menu: handleTrainingMenu,
    pro_training_menu: handleProTrainingMenu,
    home_training_menu: handleHomeTraining,
    confirm_daily_motivation: handleConfirmDailyMotivation,
    select_daily_training_type: handleSelectDailyTrainingType,
    select_daily_pro_training: handleSelectDailyProTraining,
    select_daily_home_training: handleSelectDailyHomeTraining,
    virtual_specialist_menu: handleVirtualSpecialistMenu,
    ...handleProfileOptions(),
    ...handleTrainingOptions(),
    ...handleHomeTrainingOptions(),
  };

  const daysDiff = differenceInDays(new Date(), session.updatedAt.toDate());

  if (daysDiff > 0) {
    return { msg: mainMenu(), mediaUrl: env.TEAMBOT_LOGO_URL };
  }

  const handler = stepHandlers[session.step];
  if (handler) {
    const handlerResponse = await handler(user, msg, media, contentType);
    return { msg: handlerResponse.msg, mediaUrl: handlerResponse.mediaUrl };
  }

  if (msg.trim() === "0") {
    await setSession(user.id, { step: "main_menu" });
    return { msg: mainMenu(), mediaUrl: env.TEAMBOT_LOGO_URL };
  }

  return {
    msg:
      'Desculpa, não entendi. Digite "0" para voltar ao ' + "menu principal.",
  };
}
