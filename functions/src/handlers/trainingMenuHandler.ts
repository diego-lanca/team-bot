import { UserDoc } from "../models/user";
import { hasRequiredInfos } from "../services/userService";
import {
  getUserTraining,
  setTrainingPlan,
} from "../services/trainingPlanService";
import { generateTrain } from "../services/openAiService";
import { convertToTrainingPlan } from "../models/trainingPlan";
import { setSession } from "../services/firestoreService";
import { trainingMenu } from "../bot/flows/trainingMenu";

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
  const command = msg.trim().toLowerCase();

  if (command === '0') {
    await setSession(user.id, { step: 'training_menu' });
    
    return trainingMenu();
  }

  const training = await getUserTraining(user.id);

  if (!training) {
    await setSession(user.id, { step: 'training_menu' }); 
    return "Você ainda não tem nenhum treino programado! Digite *'0'* para voltar ao menu de treinos.";
  }

  const trainingText = `Aqui está o seu treino para segunda-feira:\n- ${training.week.monday?.exercises[0].name ?? "Nenhum exercício encontrado."}`;
  
  await setSession(user.id, { step: 'training_menu' });

  return `${trainingText}\n\nO que deseja fazer agora? Digite *'0'* para voltar ao menu de treinos."`;
}

export async function handleGenerateTrainings(
  user: UserDoc,
  msg: string
): Promise<string> {
  const command = msg.trim().toLowerCase();

  if (command === '0') {
    await setSession(user.id, { step: 'training_menu' });
    return trainingMenu();
  }

  if (command !== "sim" && command !== "confirmo") {
    return 'Não entendi sua resposta. Por favor, digite "sim" para criar um novo treino ou "0" para voltar.';
  }

  const requiredInfos = hasRequiredInfos(user);
  if (!requiredInfos) {
    await setSession(user.id, { step: 'training_menu' });
    return (
      "Você ainda não completou todas as informações " +
      "necessárias pra gerar um treino.\n\nVá para a seção de perfil e verifique.\n" +
      `\n${trainingMenu()}`
    );
  }

  const train = await generateTrain(user);
  const trainingPlan = convertToTrainingPlan(train, user.id);

  await setTrainingPlan(trainingPlan);
  await setSession(user.id, { step: "training_menu" });

  return `🚀 Treino novo criado com sucesso!\n\n${trainingMenu()}`;
}
