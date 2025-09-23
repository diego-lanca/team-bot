import { profileMenu } from "../bot/flows/profileMenu";
import { UserDoc } from "../models/user";
import { setSession } from "../services/firestoreService";
import { setUser } from "../services/userService";

export function handleProfileOptions(): Record<
  string,
  (user: UserDoc, msg: string) => Promise<string>
  > {
  return {
    edit_sex: handleSex,
    edit_height: handleHeight,
    edit_weight: handleWeight,
    edit_bodyfat: handleBodyFat,
    edit_goal: handleGoal,
    edit_activity: handleActivityLevel,
    edit_conditions: handleConditions,
    edit_injuries: handleInjuries,
    edit_medications: handleMedications,
  };
}

export async function handleSex(user: UserDoc, msg: string): Promise<string> {
  const sex = msg.trim().toUpperCase();
  if (!["M", "F"].includes(sex)) {
    return "Por favor, digite M para Masculino ou F para Feminino.";
  }

  const sexoFormatado = sex === "M" ? "Masculino" : "Feminino";
  await setUser(user.id, { sex });
  await setSession(user.id, { step: "profile_menu" });
  return (
    `✅ Sexo atualizado para ${sexoFormatado} com sucesso!\n\n` + profileMenu()
  );
}

export async function handleHeight(
  user: UserDoc,
  msg: string
): Promise<string> {
  const height = parseFloat(msg.replace(",", "."));
  if (isNaN(height)) return "Digite sua altura em metros. Ex: 1.75";
  await setUser(user.id, { height });
  await setSession(user.id, { step: "profile_menu" });
  return `✅ Altura registrada: ${height} m.\n\n` + profileMenu();
}

export async function handleWeight(
  user: UserDoc,
  msg: string
): Promise<string> {
  const weight = parseFloat(msg.replace(",", "."));
  if (isNaN(weight)) return "Digite seu peso em kg. Ex: 70";
  await setUser(user.id, { weight });
  await setSession(user.id, { step: "profile_menu" });
  return `✅ Peso registrado: ${weight} kg.\n\n` + profileMenu();
}

export async function handleBodyFat(
  user: UserDoc,
  msg: string
): Promise<string> {
  const bodyFatPercentage = parseFloat(msg.replace(",", ".").replace("%", ""));
  if (isNaN(bodyFatPercentage)) {
    return "Digite sua gordura corporal em porcentagem. Ex: 82.1";
  }

  await setUser(user.id, { bodyFatPercentage });
  await setSession(user.id, { step: "profile_menu" });
  return (
    `✅ Gordura corporal registrado: ${bodyFatPercentage} %.\n\n` +
    profileMenu()
  );
}

export async function handleGoal(user: UserDoc, msg: string): Promise<string> {
  const goal = parseInt(msg);

  const goalMap: Record<number, string> = {
    1: "Perda de peso",
    2: "Ganho de massa",
    3: "Resistência",
    4: "Saúde geral",
  };

  if (isNaN(goal) || (goal < 1 && goal > 4)) {
    return "Digite uma das opções enviadas.";
  }

  await setUser(user.id, { goal });
  await setSession(user.id, { step: "profile_menu" });
  return `✅ Objetivo registrado: ${goalMap[goal]}.\n\n` + profileMenu();
}

export async function handleActivityLevel(
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

  if (isNaN(activityLevel) || (activityLevel < 1 && activityLevel > 4)) {
    return "Digite uma das opções enviadas.";
  }

  await setUser(user.id, { activityLevel });
  await setSession(user.id, { step: "profile_menu" });
  return (
    `✅ Objetivo registrado: ${activityMap[activityLevel]}.\n\n` + profileMenu()
  );
}

export async function handleConditions(
  user: UserDoc,
  msg: string
): Promise<string> {
  const medicalConditions = msg.split(",");

  if (medicalConditions.length === 0) {
    return "Digite ao menos uma condição médica. (ex: Diabetes, Hipertensão)";
  }

  await setUser(user.id, { medicalConditions });
  await setSession(user.id, { step: "profile_menu" });
  return (
    `✅ Condições médicas registradas: ${medicalConditions.join(", ")}.\n\n` +
    profileMenu()
  );
}

export async function handleInjuries(
  user: UserDoc,
  msg: string
): Promise<string> {
  const injuries = msg.split(",");

  if (injuries.length === 0) {
    return (
      "Digite ao menos um membro lesionado: " +
      "(ex: Ombro esquerdo, Mão direita)"
    );
  }

  await setUser(user.id, { injuries });
  await setSession(user.id, { step: "profile_menu" });
  return `✅ Lesões registradas: ${injuries.join(", ")}.\n\n` + profileMenu();
}

export async function handleMedications(
  user: UserDoc,
  msg: string
): Promise<string> {
  const medications = msg.split(",");

  if (medications.length === 0) {
    return (
      "Digite ao menos uma medicação: " + "(ex: Insulina, Anti-inflamatório)"
    );
  }

  await setUser(user.id, { medications });
  await setSession(user.id, { step: "profile_menu" });
  return (
    `✅ Medicamentos registradas: ${medications.join(", ")}.\n\n` +
    profileMenu()
  );
}

export async function handleProfileBack(
  user: UserDoc,
  msg: string
): Promise<string> {
  // If só pra não constar como msg não usada
  if (msg) {
    await setSession(user.id, { step: "main_menu" });
  }
  return '';
}
