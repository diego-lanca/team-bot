import { askAge } from "../bot/flows/askAge";
import { mainMenu } from "../bot/flows/mainMenu";
import { profileMenu } from "../bot/flows/profileMenu";
import { UserDoc } from "../models/user";
import { setSession } from "../services/firestoreService";
import { setUser } from "../services/userService";
import { parseAge } from "../utils/utils";

export async function handleName(user: UserDoc, msg: string): Promise<string> {
  const userName = msg.trim();
  await setUser(user.id, { name: userName });
  await setSession(user.id, { step: "ask_age" });
  return askAge({ ...user, name: userName });
}

export async function handleAge(user: UserDoc, msg: string): Promise<string> {
  const age = parseAge(msg);
  if (age === null) {
    return "Por favor, digite um número válido para a sua idade.";
  }

  await setUser(user.id, { age });
  await setSession(user.id, { step: "main_menu" });
  return (
    `Legal! Idade ${age} registrada com sucesso.\n` +
    "Agora você está pronto para começar!\n\n" +
    mainMenu()
  );
}

export async function handleMenu(user: UserDoc, msg: string): Promise<string> {
  const option = msg.trim().toLowerCase();

  const mapping: Record<string, { step: string; text: string }> = {
    "1": {
      step: "workout_menu",
      text: "Você escolheu: Treinos Personalizados.",
    },
    "2": { step: "nutrition_menu", text: "Você escolheu: Plano Alimentar." },
    "3": {
      step: "progress_menu",
      text: "Você escolheu: Progresso & Estatísticas.",
    },
    "4": { step: "quick_tips", text: "Você escolheu: Dicas Rápidas." },
    "5": { step: "profile_menu", text: profileMenu() },
  };

  const choice = mapping[option] || mapping[msg.toLowerCase()];
  if (!choice) {
    return (
      "Opção inválida. Digite um número de 1 a 5 ou o nome da opção.\n\n" +
      mainMenu()
    );
  }

  await setSession(user.id, { step: choice.step });
  return choice.text;
}

export async function handleProfileMenu(
  user: UserDoc,
  msg: string
): Promise<string> {
  const option = msg.trim();

  const mapping: Record<string, { step: string; question: string }> = {
    "1": { step: "edit_name", question: "Digite o novo nome:" },
    "2": { step: "edit_age", question: "Digite sua idade:" },
    "3": {
      step: "edit_sex",
      question: "Digite M para Masculino ou F para Feminino:",
    },
    "4": {
      step: "edit_height",
      question: "Digite sua altura em metros (ex: 1.75):",
    },
    "5": { step: "edit_weight", question: "Digite seu peso em kg (ex: 70):" },
    "6": {
      step: "edit_bodyfat",
      question: "Digite sua % de gordura corporal:",
    },
    "7": {
      step: "edit_goal",
      question: "Qual é sua meta? (ex: perder peso, ganhar massa…)",
    },
    "8": {
      step: "edit_activity",
      question:
        "Qual é seu nível de atividade? (sedentário, moderado, intenso…)",
    },
    "9": {
      step: "edit_conditions",
      question: "Liste condições médicas relevantes:",
    },
    "10": {
      step: "edit_injuries",
      question: "Informe lesões atuais ou anteriores:",
    },
    "11": { step: "edit_medications", question: "Liste medicamentos em uso:" },
  };

  const choice = mapping[option];
  if (!choice) return "Opção inválida. Digite um número de 1 a 12.";

  await setSession(user.id, { step: choice.step });
  return choice.question;
}
