import { profileMenu } from "../bot/flows/profileMenu";
import { UserDoc } from "../models/user";
import { setSession } from "../services/firestoreService";
import { setUser } from "../services/userService";
import { parseAge } from "../utils/utils";

export function handleProfileOptions(): Record<
  string,
  (user: UserDoc, msg: string) => Promise<{ msg: string; mediaUrl?: string }>
  > {
  return {
    edit_name: handleEditName,
    edit_age: handleEditAge,
    edit_sex: handleSex,
    edit_height: handleHeight,
    edit_weight: handleWeight,
    edit_bodyfat: handleBodyFat,
    edit_goal: handleGoal,
    edit_activity: handleActivityLevel,
    edit_conditions: handleConditions,
    edit_injuries: handleInjuries,
    edit_medications: handleMedications,
    edit_training_preference: handleTrainingPreference,
    edit_training_hour: handleTrainingHour,
  };
}

export async function handleEditName(
  user: UserDoc,
  msg: string
): Promise<{ msg: string; mediaUrl?: string }> {
  if (msg.trim() == "0") {
    await setSession(user.id, { step: "profile_menu" });
    return { msg: profileMenu() };
  }

  const userName = msg.trim();

  if (userName.length < 2 || userName.length > 50 || /^\d+$/.test(userName)) {
    return {
      msg:
        "Hmm, esse nome não parece válido. 🤔\n" +
        "Por favor, digite um nome real para que a " +
        "gente possa se conhecer melhor.",
    };
  }

  await setUser(user.id, { name: userName });
  await setSession(user.id, { step: "profile_menu" });

  return {
    msg: `✅ Nome atualizado para *${userName}*!\n\n` + profileMenu(),
  };
}

export async function handleEditAge(
  user: UserDoc,
  msg: string
): Promise<{ msg: string; mediaUrl?: string }> {
  if (msg.trim() == "0") {
    await setSession(user.id, { step: "profile_menu" });
    return { msg: profileMenu() };
  }

  const age = parseAge(msg);
  if (age === null || age < 12 || age > 100) {
    return { msg: "Por favor, digite um número válido para a sua idade." };
  }

  await setUser(user.id, { age: age });
  await setSession(user.id, { step: "profile_menu" });

  return {
    msg: `✅ Idade atualizada para *${age} anos*!\n\n` + profileMenu(),
  };
}

export async function handleSex(
  user: UserDoc,
  msg: string
): Promise<{ msg: string; mediaUrl?: string }> {
  if (msg.trim() == "0") {
    await setSession(user.id, { step: "profile_menu" });
    return { msg: profileMenu() };
  }

  const sex = msg.trim().toUpperCase();
  if (!["M", "F"].includes(sex)) {
    return {
      msg: "Por favor, digite M para Masculino ou F para Feminino.",
    };
  }

  const sexoFormatado = sex === "M" ? "Masculino" : "Feminino";
  await setUser(user.id, { sex });
  await setSession(user.id, { step: "profile_menu" });
  return {
    msg:
      `✅ Sexo atualizado para ${sexoFormatado} com sucesso!\n\n` +
      profileMenu(),
  };
}

export async function handleHeight(
  user: UserDoc,
  msg: string
): Promise<{ msg: string; mediaUrl?: string }> {
  if (msg.trim() == "0") {
    await setSession(user.id, { step: "profile_menu" });
    return { msg: profileMenu() };
  }

  const cleanText = msg.trim().replace(",", ".");
  if (!/^\d+(\.\d+)?$/.test(cleanText)) {
    return { msg: "Digite uma altura válida em metros. Ex: 1.75" };
  }

  const height = parseFloat(cleanText);
  if (height < 0.5 || height > 2.5) {
    return { msg: "Altura fora do intervalo válido (entre 0.5 m e 2.5 m)." };
  }

  await setUser(user.id, { height });
  await setSession(user.id, { step: "profile_menu" });
  return { msg: `✅ Altura registrada: ${height} m.\n\n` + profileMenu() };
}

export async function handleWeight(
  user: UserDoc,
  msg: string
): Promise<{ msg: string; mediaUrl?: string }> {
  if (msg.trim() == "0") {
    await setSession(user.id, { step: "profile_menu" });
    return { msg: profileMenu() };
  }

  const cleanText = msg.trim().replace(",", ".");
  if (!/^\d+(\.\d+)?$/.test(cleanText)) {
    return { msg: "Digite um peso válido em quilos. Ex: 75" };
  }

  const weight = parseFloat(cleanText);
  if (weight < 20 || weight > 300) {
    return { msg: "Peso fora do intervalo válido (entre 20kg e 300kg)." };
  }

  await setUser(user.id, { weight });
  await setSession(user.id, { step: "profile_menu" });
  return { msg: `✅ Peso registrado: ${weight} kg.\n\n` + profileMenu() };
}

export async function handleBodyFat(
  user: UserDoc,
  msg: string
): Promise<{ msg: string; mediaUrl?: string }> {
  if (msg.trim() == "0") {
    await setSession(user.id, { step: "profile_menu" });
    return { msg: profileMenu() };
  }
  const cleanText = msg.trim().replace(",", ".");
  if (!/^\d+(\.\d+)?$/.test(cleanText)) {
    return {
      msg: "Digite uma porcentagem válida de gordura corporal. Ex: 18.5",
    };
  }

  const bodyFatPercentage = parseFloat(cleanText);
  if (bodyFatPercentage < 2 || bodyFatPercentage > 70) {
    return {
      msg: "Percentual de gordura fora do intervalo válido (entre 2% e 70%).",
    };
  }

  await setUser(user.id, { bodyFatPercentage });
  await setSession(user.id, { step: "profile_menu" });
  return {
    msg:
      `✅ Gordura corporal registrado: ${bodyFatPercentage} %.\n\n` +
      profileMenu(),
  };
}

export async function handleGoal(
  user: UserDoc,
  msg: string
): Promise<{ msg: string; mediaUrl?: string }> {
  if (msg.trim() == "0") {
    await setSession(user.id, { step: "profile_menu" });
    return { msg: profileMenu() };
  }

  const goal = parseInt(msg);

  const goalMap: Record<number, string> = {
    1: "Perda de peso",
    2: "Ganho de massa",
    3: "Resistência",
    4: "Saúde geral",
  };

  if (isNaN(goal) || goal < 1 || goal > 4) {
    return { msg: "Digite uma das opções enviadas." };
  }

  await setUser(user.id, { goal });
  await setSession(user.id, { step: "profile_menu" });
  return {
    msg: `✅ Objetivo registrado: ${goalMap[goal]}.\n\n` + profileMenu(),
  };
}

export async function handleActivityLevel(
  user: UserDoc,
  msg: string
): Promise<{ msg: string; mediaUrl?: string }> {
  if (msg.trim() == "0") {
    await setSession(user.id, { step: "profile_menu" });
    return { msg: profileMenu() };
  }

  const activityLevel = parseInt(msg);

  const activityMap: Record<number, string> = {
    1: "Sedentário",
    2: "Leve",
    3: "Moderado",
    4: "Intenso",
  };

  if (isNaN(activityLevel) || activityLevel < 1 || activityLevel > 4) {
    return { msg: "Digite uma das opções enviadas." };
  }

  await setUser(user.id, { activityLevel });
  await setSession(user.id, { step: "profile_menu" });
  return {
    msg:
      `✅ Objetivo registrado: ${activityMap[activityLevel]}.\n\n` +
      profileMenu(),
  };
}

export async function handleConditions(
  user: UserDoc,
  msg: string
): Promise<{ msg: string; mediaUrl?: string }> {
  if (msg.trim() == "0") {
    await setSession(user.id, { step: "profile_menu" });
    return { msg: profileMenu() };
  }
  const medicalConditions = msg.split(",");

  if (medicalConditions.length === 0) {
    return {
      msg:
        "Digite ao menos uma condição médica. " +
        "(ex: Diabetes, Hipertensão), ou *0* para nenhuma.",
    };
  }

  await setUser(user.id, { medicalConditions });
  await setSession(user.id, { step: "profile_menu" });
  return {
    msg:
      `✅ Condições médicas registradas: ${medicalConditions.join(", ")}.\n\n` +
      profileMenu(),
  };
}

export async function handleInjuries(
  user: UserDoc,
  msg: string
): Promise<{ msg: string; mediaUrl?: string }> {
  if (msg.trim() == "0") {
    await setSession(user.id, { step: "profile_menu" });
    return { msg: profileMenu() };
  }
  const injuries = msg.split(",");

  if (injuries.length === 0) {
    return {
      msg:
        "Digite ao menos um membro lesionado: " +
        "(ex: Ombro esquerdo, Mão direita ou até mesmo Nenhuma)",
    };
  }

  await setUser(user.id, { injuries });
  await setSession(user.id, { step: "profile_menu" });
  return {
    msg: `✅ Lesões registradas: ${injuries.join(", ")}.\n\n` + profileMenu(),
  };
}

export async function handleMedications(
  user: UserDoc,
  msg: string
): Promise<{ msg: string; mediaUrl?: string }> {
  if (msg.trim() == "0") {
    await setSession(user.id, { step: "profile_menu" });
    return { msg: profileMenu() };
  }
  const medications = msg.split(",");

  if (medications.length === 0) {
    return {
      msg:
        "Digite ao menos uma medicação: " +
        "(ex: Insulina, Anti-inflamatório ou até mesmo Nenhuma)",
    };
  }

  await setUser(user.id, { medications });
  await setSession(user.id, { step: "profile_menu" });
  return {
    msg:
      `✅ Medicamentos registradas: ${medications.join(", ")}.\n\n` +
      profileMenu(),
  };
}

export async function handleTrainingPreference(
  user: UserDoc,
  msg: string
): Promise<{ msg: string; mediaUrl?: string }> {
  const choice = msg.trim();

  if (choice === "0") {
    await setSession(user.id, { step: "profile_menu" });
    return { msg: profileMenu() };
  }

  if (choice !== "1" && choice !== "2") {
    return {
      msg:
        "❌ Opção inválida. Por favor, digite *1* para Automático, " +
        "*2* para Manual ou *0* para voltar.",
    };
  }

  const wantsToChoose = choice === "2";

  await setUser(user.id, { chooseTrainOnDayMotivation: wantsToChoose });
  await setSession(user.id, { step: "profile_menu" });

  const newPreferenceText = wantsToChoose
    ? "Manual (Escolher o treino)"
    : "Automático (Receber o treino do dia)";

  return {
    msg:
      `✅ Preferência atualizada para: *${newPreferenceText}*.\n\n` +
      profileMenu(),
  };
}

export async function handleTrainingHour(
  user: UserDoc,
  msg: string
): Promise<{ msg: string; mediaUrl?: string }> {
  const choice = msg.trim();

  if (choice === "0") {
    await setSession(user.id, { step: "profile_menu" });
    return { msg: profileMenu() };
  }

  const response = msg.trim();
  const [hourString, minutesString] = response.split(":");

  if (!hourString || !minutesString) {
    return { msg: "Insira um horário no formado válido (ex: 17:30)" };
  }

  const hour = parseInt(hourString);
  const minutes = parseInt(minutesString);

  console.log(typeof hour);
  console.log(typeof minutes);

  if (Number.isNaN(hour) || Number.isNaN(minutes)) {
    return { msg: "Insira um horário com números válidos (ex: 17:30)" };
  }

  if (hour < 0 || hour > 24 || minutes < 0 || minutes > 59) {
    return { msg: "Insira um horário existente (ex: 17:30)" };
  }

  await setUser(user.id, { trainingHour: `${hour}:${minutes}` });
  await setSession(user.id, { step: "profile_menu" });

  return {
    msg:
      `✅ Horário de treino atualizado para: *${response}*.\n\n` +
      profileMenu(),
  };
}
