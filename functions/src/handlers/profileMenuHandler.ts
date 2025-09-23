import { UserDoc } from "../models/user";
import { setSession } from "../services/firestoreService";
import { setUser } from "../services/userService";

export async function handleSex(user: UserDoc, msg: string): Promise<string> {
  const sex = msg.trim().toUpperCase();
  if (!["M", "F"].includes(sex)) {
    return "Por favor, digite M para Masculino ou F para Feminino.";
  }
  await setUser(user.id, { sex });
  await setSession(user.id, { step: "profile_menu" });
  return `Sexo atualizado para ${
    sex === "M" ? "Masculino" : "Feminino"
  } com sucesso!`;
}

export async function handleHeight(
  user: UserDoc,
  msg: string
): Promise<string> {
  const height = parseFloat(msg.replace(",", "."));
  if (isNaN(height)) return "Digite sua altura em metros. Ex: 1.75";
  await setUser(user.id, { height });
  await setSession(user.id, { step: "profile_menu" });
  return `Altura registrada: ${height} m.`;
}

export async function handleWeight(
  user: UserDoc,
  msg: string
): Promise<string> {
  const weight = parseFloat(msg.replace(",", "."));
  if (isNaN(weight)) return "Digite seu peso em kg. Ex: 70";
  await setUser(user.id, { weight });
  await setSession(user.id, { step: "profile_menu" });
  return `Peso registrado: ${weight} kg.`;
}
