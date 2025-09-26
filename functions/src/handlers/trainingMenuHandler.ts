import OpenAI from "openai";
import { UserDoc } from "../models/user";
import { hasRequiredInfos } from "../services/userService";
import { env } from "../config/env";
import { getUserTraining } from "../services/trainingPlanService";

const client = new OpenAI({
  apiKey: env.OPENAI_KEY,
});

export function handleTrainingOptions(): Record<
  string,
  (user: UserDoc, msg: string) => Promise<string>
> {
  return {
    see_training: handleSeeTraining,
    generate_trainings: handleGenerateTrainings,
  };
}

export async function handleSeeTraining(
  user: UserDoc,
  msg: string
): Promise<string> {
  const training = await getUserTraining(user.id);
  if (!training) return "Você não tem nenhum treino programado!";

  const today = new Date().getDay;

  return training.week.monday?.exercises[0].name ?? "";
}

export async function handleGenerateTrainings(
  user: UserDoc,
  msg: string
): Promise<string> {
  const requiredInfos = hasRequiredInfos(user);
  if (!requiredInfos) {
    return (
      "Você ainda não completou todas as informações" +
      "necessárias pra gerar um treino.\nVá pra seção de perfil e verifique."
    );
  }

  const response = await client.responses.create({
    model: "gpt-5-nano",
    input: "",
  });

  console.log(response.output_text);
  return response.output_text;
}
