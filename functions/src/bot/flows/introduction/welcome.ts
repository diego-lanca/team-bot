import { UserDoc } from "../../../models/user";
import { setSession } from "../../../services/firestoreService";

export async function welcome(user: UserDoc): Promise<string> {
  await setSession(user.id, {
    step: "welcome",
  });

  return (
    "Oi! Sou o Team Bot, seu maior incentivador nessa jornada. 💪\n" +
    "Minha missão é simples: garantir que você nunca se sinta perdido(a) " +
    "ou desmotivado(a). Como seu personal digital, vou:\n" +
    "✅ Criar treinos inteligentes, adaptados ao seu corpo e objetivo.\n" +
    "✅ Enviar motivação diária, porque sei que a consistência é essencial.\n" +
    "✅ Acompanhar sua evolução e celebrar cada conquista com você.\n\n" +
    "Para começar, qual o seu nome? 🏋️‍♂️"
  );
}
