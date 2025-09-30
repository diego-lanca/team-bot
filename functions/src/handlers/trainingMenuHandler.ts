import { UserDoc } from "../models/user";
import { hasRequiredInfos } from "../services/userService";
import { getUserTraining } from "../services/trainingPlanService";
import { generateTrain } from "../services/openAiService";

export function handleTrainingOptions(): Record<
  string,
  (user: UserDoc, msg: string) => Promise<string>
> {
  return {
    see_training_confirm: handleSeeTraining,
    generate_training_confirm: handleGenerateTrainings,
  };
}

export async function handleSeeTraining(
  user: UserDoc,
  msg: string
): Promise<string> {
  const training = await getUserTraining(user.id);
  if (!training) return "Você não tem nenhum treino programado!";

  // const today = new Date().getDay;

  return training.week.monday?.exercises[0].name ?? "";
}

export async function handleGenerateTrainings(
  user: UserDoc,
  msg: string
): Promise<string> {
  if (msg.toLowerCase() !== "sim" && msg.toLowerCase() !== "confirmo") {
    return "Voltando ao menu anterior...: ";
  }

  const requiredInfos = hasRequiredInfos(user);
  if (!requiredInfos) {
    return (
      "Você ainda não completou todas as informações " +
      "necessárias pra gerar um treino.\nVá pra seção de perfil e verifique."
    );
  }

  const train = await generateTrain(user);

  return train;
}
