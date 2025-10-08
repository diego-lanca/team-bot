// Roteamento de mensagens
import { differenceInDays } from "date-fns";
import { UserDoc } from "../models/user";
import { getSession, setSession } from "../services/firestoreService";
import { welcome } from "./flows/welcome";
import {
  handleAcceptTerms,
  handleAge,
  handleEditAge,
  handleEditName,
  handleMenu,
  handleName,
  handleProfileMenu,
  handleTrainingMenu,
  handleVirtualSpecialistMenu,
} from "../handlers/stepHandler";
import { handleProfileOptions } from "../handlers/profileMenuHandler";
import { handleTrainingOptions } from "../handlers/trainingMenuHandler";
import { mainMenu } from "./flows/mainMenu";

export async function route(
  user: UserDoc,
  msg: string,
  media?: string,
  contentType?: string
): Promise<string> {
  const session = await getSession(user.id);

  if (!session) {
    return welcome(user);
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
    welcome: handleName,
    ask_age: handleAge,
    ask_terms: handleAcceptTerms,
    main_menu: handleMenu,
    profile_menu: handleProfileMenu,
    training_menu: handleTrainingMenu,
    virtual_specialist_menu: handleVirtualSpecialistMenu,
    edit_name: handleEditName,
    edit_age: handleEditAge,
    ...handleProfileOptions(),
    ...handleTrainingOptions(),
  };

  const daysDiff = differenceInDays(new Date(), session.updatedAt.toDate());

  if (daysDiff > 0) {
    return mainMenu();
  }

  const handler = stepHandlers[session.step];
  if (handler) return handler(user, msg, media, contentType);

  if (msg.trim() === "0") {
    await setSession(user.id, { step: "main_menu" });
    return mainMenu();
  }

  return (
    'Desculpa, não entendi. Digite "0" para voltar ao ' +
    'menu principal ou "ajuda" para ver as opções.'
  );
}
