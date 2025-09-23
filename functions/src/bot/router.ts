// Roteamento de mensagens
import { differenceInDays } from "date-fns";
import { UserDoc } from "../models/user";
import { getSession } from "../services/firestoreService";
import { greetings } from "./flows/greetings";
import { welcome } from "./flows/welcome";
import {
  handleAge,
  handleMenu,
  handleName,
  handleProfileMenu,
} from "../handlers/stepHandler";
import {
  handleHeight,
  handleSex,
  handleWeight,
} from "../handlers/profileMenuHandler";

export async function route(user: UserDoc, msg: string): Promise<string> {
  const session = await getSession(user.id);

  if (!session) {
    return welcome(user);
  }

  const stepHandlers: Record<
    string,
    (user: UserDoc, msg: string) => Promise<string>
  > = {
    welcome: handleName,
    ask_age: handleAge,
    main_menu: handleMenu,
    profile_menu: handleProfileMenu,
    edit_sex: handleSex,
    edit_height: handleHeight,
    edit_weight: handleWeight,
  };

  const handler = stepHandlers[session.step];
  if (handler) return handler(user, msg);

  const daysDiff = differenceInDays(new Date(), session.updatedAt.toDate());

  if (daysDiff > 0) {
    return greetings();
  }

  return 'Desculpa, não entendi. Digite "ajuda" para opções.';
}
