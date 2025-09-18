import { UserDoc } from "../../models/user";
import { setSession } from "../../services/firestoreService";

export async function welcome(user: UserDoc): Promise<string> {
  await setSession(user.id, {
    step: "welcome",
  });

  return (
    "💪 Olá! Eu sou o TeamBot, seu assistente virtual de treinos e saúde." +
    "\nAntes de começarmos, qual é o seu nome? " +
    "Assim posso personalizar suas dicas e treinos! 🏋️‍♂️"
  );
}
