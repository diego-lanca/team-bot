// Roteamento de mensagens
import { differenceInDays } from "date-fns";
import { UserDoc } from "../models/user";
import { getSession, setSession } from "../services/firestoreService";
import { welcome } from "./flows/introduction/welcome";
import {
  handleEditAge,
  handleEditName,
  handleMenu,
  handleProfileMenu,
  handleSelectDailyTraining,
  handleTrainingMenu,
  handleVirtualSpecialistMenu,
} from "../handlers/stepHandler";
import { handleProfileOptions } from "../handlers/profileMenuHandler";
import { handleTrainingOptions } from "../handlers/trainingMenuHandler";
import { mainMenu } from "./flows/mainMenu";
import { handleIntrodutionOptions } from "../handlers/introdutionHandler";
import { env } from "../config/env";

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
    ) => Promise<string>
  > = {
    ...handleIntrodutionOptions(),
    main_menu: handleMenu,
    profile_menu: handleProfileMenu,
    training_menu: handleTrainingMenu,
    select_daily_training: handleSelectDailyTraining,
    virtual_specialist_menu: handleVirtualSpecialistMenu,
    edit_name: handleEditName,
    edit_age: handleEditAge,
    ...handleProfileOptions(),
    ...handleTrainingOptions(),
  };

  const daysDiff = differenceInDays(new Date(), session.updatedAt.toDate());

  if (daysDiff > 0) {
    return { msg: mainMenu(), mediaUrl: env.TEAMBOT_LOGO_URL };
  }

  const handler = stepHandlers[session.step];
  if (handler) return { msg: await handler(user, msg, media, contentType) };

  if (msg.trim() === "0") {
    await setSession(user.id, { step: "main_menu" });
    return { msg: mainMenu(), mediaUrl: env.TEAMBOT_LOGO_URL };
  }

  return {
    msg:
      'Desculpa, não entendi. Digite "0" para voltar ao ' +
      'menu principal ou "ajuda" para ver as opções.',
  };
}
