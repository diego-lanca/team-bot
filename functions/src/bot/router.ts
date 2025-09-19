// Roteamento de mensagens
import { differenceInDays } from "date-fns";
import { UserDoc } from "../models/user";
import { getSession, setSession } from "../services/firestoreService";
import { greetings } from "./flows/greetings";
import { welcome } from "./flows/welcome";
import { askAge } from "./flows/askAge";
import { setUser } from "../services/userService";

export async function route(user: UserDoc, msg: string): Promise<string> {
  const session = await getSession(user.id);

  if (!session) {
    return welcome(user);
  }

  // ETAPA 1: Processar a resposta do nome
  if (session.step === "welcome") {
    // 1. Salvar o nome que veio na mensagem
    const userName = msg.trim(); // Usamos trim() para remover espaços extras
    await setUser(user.id, { name: userName });

    // 2. Atualizar o passo da sessão para o próximo
    await setSession(user.id, { step: "ask_age" });

    // 3. Chamar a próxima função, passando o usuário com os dados atualizados
    const updatedUser: UserDoc = { ...user, name: userName };
    return askAge(updatedUser); // Agora 'askAge' terá o nome correto!
  }

  // ETAPA 2: Processar a resposta da idade
  if (session.step === "ask_age") {
    const age = parseInt(msg.trim(), 10);

    // Validação simples para ver se o que o usuário digitou é um número
    if (isNaN(age)) {
      return "Por favor, digite um número válido para a sua idade.";
    }

    // 1. Salvar a idade
    await setUser(user.id, { age: age });

    // 2. Atualizar o passo da sessão para indicar que o onboarding acabou
    await setSession(user.id, { step: "main_menu" });

    // 3. Enviar a próxima mensagem
    return `Legal! Idade ${age} registrada com sucesso. Agora você está pronto para começar. Digite "ajuda" para ver os comandos.`;
  }

  const daysDiff = differenceInDays(new Date(), session.updatedAt.toDate());

  if (daysDiff > 0) {
    return greetings();
  }

  return 'Desculpa, não entendi. Digite "ajuda" para opções.';
}