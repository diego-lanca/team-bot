import { askActivityLevel } from "../bot/flows/introduction/askActivtyLevel";
import { askAge } from "../bot/flows/introduction/askAge";
// eslint-disable-next-line max-len
import { askBodyFatPercentage } from "../bot/flows/introduction/askBodyFatPercentage";
import { askGoal } from "../bot/flows/introduction/askGoal";
import { askHeight } from "../bot/flows/introduction/askHeight";
import { askInjuries } from "../bot/flows/introduction/askInjuries";
// eslint-disable-next-line max-len
import { askMedicalConditions } from "../bot/flows/introduction/askMedicalConditions";
import { askMedications } from "../bot/flows/introduction/askMedications";
import { askSex } from "../bot/flows/introduction/askSex";
import { askWeight } from "../bot/flows/introduction/askWeight";
import { mainMenu } from "../bot/flows/mainMenu";
import { UserDoc } from "../models/user";
import { setSession } from "../services/firestoreService";
import { setUser } from "../services/userService";
import { parseAge } from "../utils/utils";

export function handleIntrodutionOptions(): Record<
  string,
  (user: UserDoc, msg: string) => Promise<string>
> {
  return {
    welcome: handleAskName,
    ask_age: handleAskAge,
    ask_sex: handleAskSex,
    ask_height: handleAskHeight,
    ask_weight: handleAskWeight,
    ask_bodyfat: handleAskBodyFat,
    ask_goal: handleAskGoal,
    ask_activitylevel: handleAskActivityLevel,
    ask_conditions: handleAskConditions,
    ask_injuries: handleAskInjuries,
    ask_medications: handleAskMedications,
    ask_terms: handleAskAcceptTerms,
  };
}

export async function handleAskName(
  user: UserDoc,
  msg: string
): Promise<string> {
  const userName = msg.trim();

  // Verificação do Nome (numero e comprimento)
  if (userName.length < 2 || userName.length > 50 || /^\d+$/.test(userName)) {
    return (
      "Hmm, esse nome não parece válido. 🤔\n" +
      "Por favor, digite um nome real para que a " +
      "gente possa se conhecer melhor."
    );
  }

  await setUser(user.id, { name: userName });
  await setSession(user.id, { step: "ask_age" });
  return `🙋‍♂️ Nome registrado com sucesso: *${userName}*.\n\n` + askAge();
}

export async function handleAskAge(
  user: UserDoc,
  msg: string
): Promise<string> {
  const age = parseAge(msg);
  if (age === null || age < 12 || age > 100) {
    return "Por favor, digite um número válido para a sua idade.";
  }

  await setUser(user.id, { age });
  await setSession(user.id, { step: "ask_sex" });
  return (
    `🎉 Ótimo! Sua idade foi registrada como *${age}* com sucesso!\n\n` +
    askSex()
  );
}

export async function handleAskSex(
  user: UserDoc,
  msg: string
): Promise<string> {
  const sex = msg.trim().toUpperCase();
  if (!["M", "F"].includes(sex)) {
    return "Por favor, digite M para Masculino ou F para Feminino.";
  }

  const sexoFormatado = sex === "M" ? "Masculino" : "Feminino";
  await setUser(user.id, { sex });
  await setSession(user.id, { step: "ask_height" });
  return (
    `👤 Sexo atualizado para *${sexoFormatado}* com sucesso!\n\n` + askHeight()
  );
}

export async function handleAskHeight(
  user: UserDoc,
  msg: string
): Promise<string> {
  const cleanText = msg.trim().replace(",", ".");

  if (!/^\d+(\.\d+)?$/.test(cleanText)) {
    return "Digite uma altura válida em metros. Ex: 1.75";
  }

  const height = parseFloat(cleanText);

  if (height < 0.5 || height > 2.5) {
    return "Altura fora do intervalo válido (entre 0.5 m e 2.5 m).";
  }

  await setUser(user.id, { height });
  await setSession(user.id, { step: "ask_weight" });
  return `📏 Altura registrada com sucesso: *${height} m*.\n\n` + askWeight();
}

export async function handleAskWeight(
  user: UserDoc,
  msg: string
): Promise<string> {
  const cleanText = msg.trim().replace(",", ".");

  if (!/^\d+(\.\d+)?$/.test(cleanText)) {
    return "Digite um peso válida em kilos. Ex: 75";
  }

  const weight = parseFloat(cleanText);

  if (weight < 20 || weight > 300) {
    return "Peso fora do intervalo válido (entre 20kg e 300kg).";
  }

  await setUser(user.id, { weight });
  await setSession(user.id, { step: "ask_bodyfat" });
  return (
    `🏋️‍♂️ Peso registrado com sucesso: *${weight} kg*.\n\n` +
    askBodyFatPercentage()
  );
}

export async function handleAskBodyFat(
  user: UserDoc,
  msg: string
): Promise<string> {
  if (msg.trim() == "0") {
    await setSession(user.id, { step: "ask_goal" });
    return askGoal();
  }

  const cleanText = msg.trim().replace(",", ".");

  if (!/^\d+(\.\d+)?$/.test(cleanText)) {
    return "Digite uma porcentagem válida de gordura corporal. Ex: 18.5";
  }

  const bodyFatPercentage = parseFloat(cleanText);

  if (bodyFatPercentage < 2 || bodyFatPercentage > 70) {
    return "Percentual de gordura fora do intervalo válido (entre 2% e 70%).";
  }

  await setUser(user.id, { bodyFatPercentage });
  await setSession(user.id, { step: "ask_goal" });
  return (
    `📊 Gordura corporal registrada: *${bodyFatPercentage}%*.\n\n` + askGoal()
  );
}

export async function handleAskGoal(
  user: UserDoc,
  msg: string
): Promise<string> {
  const goal = parseInt(msg);

  const goalMap: Record<number, string> = {
    1: "Perda de peso",
    2: "Ganho de massa",
    3: "Resistência",
    4: "Saúde geral",
  };

  if (isNaN(goal) || goal < 1 || goal > 4) {
    return "Digite uma das opções enviadas.";
  }

  await setUser(user.id, { goal });
  await setSession(user.id, { step: "ask_activitylevel" });
  return (
    `🏁 Objetivo registrado com sucesso: *${goalMap[goal]}*.\n\n` +
    askActivityLevel()
  );
}

export async function handleAskActivityLevel(
  user: UserDoc,
  msg: string
): Promise<string> {
  const activityLevel = parseInt(msg);

  const activityMap: Record<number, string> = {
    1: "Sedentário",
    2: "Leve",
    3: "Moderado",
    4: "Intenso",
  };

  if (isNaN(activityLevel) || activityLevel < 1 || activityLevel > 4) {
    return "Digite uma das opções enviadas.";
  }

  await setUser(user.id, { activityLevel });
  await setSession(user.id, { step: "ask_conditions" });
  return (
    `✅ Nível de atividade registrado: *${activityMap[activityLevel]}*.\n\n` +
    askMedicalConditions()
  );
}

export async function handleAskConditions(
  user: UserDoc,
  msg: string
): Promise<string> {
  if (msg.trim() == "0") {
    await setSession(user.id, { step: "ask_injuries" });
    return askInjuries();
  }
  const medicalConditions = msg.split(",");

  if (medicalConditions.length === 0) {
    return (
      "Digite ao menos uma condição médica. " +
      "(ex: Diabetes, Hipertensão), ou *0* para nenhuma."
    );
  }

  await setUser(user.id, { medicalConditions });
  await setSession(user.id, { step: "profile_menu" });
  return (
    `📝 Condições médicas registradas: *${medicalConditions.join(", ")}*.\n\n` +
    askInjuries()
  );
}

export async function handleAskInjuries(
  user: UserDoc,
  msg: string
): Promise<string> {
  if (msg.trim() == "0") {
    await setSession(user.id, { step: "ask_medications" });
    return askMedications();
  }
  const injuries = msg.split(",");

  if (injuries.length === 0) {
    return (
      "Digite ao menos um membro lesionado: " +
      "(ex: Ombro esquerdo, Mão direita), ou *0* para nenhuma."
    );
  }

  await setUser(user.id, { injuries });
  await setSession(user.id, { step: "ask_medications" });
  return (
    `🤕 Lesões registradas: *${injuries.join(", ")}*.\n\n` + askMedications()
  );
}

export async function handleAskMedications(
  user: UserDoc,
  msg: string
): Promise<string> {
  if (msg.trim() == "0") {
    await setSession(user.id, { step: "ask_terms" });
    return `HX7ee867afe41d6ad43796d4645744f412`;
  }
  const medications = msg.split(",");

  if (medications.length === 0) {
    return (
      "Digite ao menos uma medicação: " +
      "(ex: Insulina, Anti-inflamatório), ou *0* para nenhuma."
    );
  }

  await setUser(user.id, { medications });
  await setSession(user.id, { step: "ask_terms" });
  return `HX7ee867afe41d6ad43796d4645744f412`;
}

export async function handleAskAcceptTerms(
  user: UserDoc,
  msg: string
): Promise<string> {
  const response = msg.trim().toLowerCase();

  if (response.includes("aceito")) {
    await setUser(user.id, { acceptedTerms: true });
  }

  await setSession(user.id, { step: "main_menu" });

  return mainMenu();
}
