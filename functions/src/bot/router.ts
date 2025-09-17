// Roteamento de mensagens

import { differenceInDays } from "date-fns";
import { UserDoc } from "../models/user";
import { getSession } from "../services/firestoreService";
import { greetings } from "./flows/greetings";
import { welcome } from "./flows/welcome";
import { askName } from "./flows/askName";

export async function route(user: UserDoc, msg: string): Promise<string> {
  const session = await getSession(user.id);

  if (!session) return welcome();

  if (session.step == 'ask_name') {
    console.log (askName(msg));
  }

  const daysDiff = differenceInDays(new Date(), session.updatedAt.toDate());

  if (daysDiff > 0) {
    return greetings();
  }

  return 'Desculpa, não entendi. Digite "ajuda" para opções.';
}
