import { UserDoc } from "../models/user";
import { hasRequiredInfos } from "../services/userService";
import {
  getUserTraining,
  setTrainingPlan,
} from "../services/trainingPlanService";
import { generateTrain } from "../services/openAiService";
import { convertToTrainingPlan, WeekDay } from "../models/trainingPlan";
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

  if (command === "0") {
    await setSession(user.id, { step: "training_menu" });
    return trainingMenu();
  }

  const training = await getUserTraining(user.id);

  if (!training) {
    await setSession(user.id, { step: "training_menu" });
    return (
      "Você ainda não tem nenhum treino programado! " +
      "Digite *0* para voltar ao menu de treinos."
    );
  }

  const today = new Date();
  const weekDay = today.getDay(); // 0=domingo ... 6=sábado

  // Mapeia para WeekDay + tradução
  const daysMap: { [key: number]: { key: WeekDay; label: string } } = {
    0: { key: "sunday", label: "Domingo" },
    1: { key: "monday", label: "Segunda-feira" },
    2: { key: "tuesday", label: "Terça-feira" },
    3: { key: "wednesday", label: "Quarta-feira" },
    4: { key: "thursday", label: "Quinta-feira" },
    5: { key: "friday", label: "Sexta-feira" },
    6: { key: "saturday", label: "Sábado" },
  };

  const dayInfo = daysMap[weekDay];
  const dayTraining = training.week[dayInfo.key];

  if (!dayTraining) {
    await setSession(user.id, { step: "training_menu" });
    return (
      `Não há treino programado para ${dayInfo.label}.\n\n` +
      "Digite *0* para voltar ao menu de treinos."
    );
  }

  // Monta texto formatado
  let trainingText = `📅 *${dayInfo.label}*\n`;
  trainingText += `📌 Treino: ${dayTraining.name}\n\n`;

  if (dayTraining.exercises.length > 0) {
    trainingText += "🏋️ *Exercícios*:\n";
    dayTraining.exercises.forEach((ex, idx) => {
      trainingText += `   ${idx + 1}. ${ex.name}\n`;
      trainingText += `      • Séries: ${ex.sets}\n`;
      trainingText += `      • Repetições: ${ex.reps}\n`;
      if (ex.restSeconds) {
        trainingText += `      • Descanso: ${ex.restSeconds}s\n`;
      }
      if (ex.notes) {
        trainingText += `      • Obs: ${ex.notes}\n`;
      }
    });
  } else {
    trainingText += "   Nenhum exercício cadastrado.\n";
  }

  await setSession(user.id, { step: "training_menu" });

  return (
    `${trainingText}\n\nO que deseja fazer agora?\n` +
    "Digite *0* para voltar ao menu de treinos."
  );
}

export async function handleGenerateTrainings(
  user: UserDoc,
  msg: string
): Promise<string> {
  const command = msg.trim().toLowerCase();

  if (command === "0") {
    await setSession(user.id, { step: "training_menu" });
    return trainingMenu();
  }

  if (command !== "sim" && command !== "confirmo") {
    return (
      'Não entendi sua resposta. Por favor, digite "sim" para ' +
      'criar um novo treino ou "0" para voltar.'
    );
  }

  const requiredInfos = hasRequiredInfos(user);
  if (!requiredInfos) {
    await setSession(user.id, { step: "training_menu" });
    return (
      "Você ainda não completou todas as informações " +
      "necessárias pra gerar um treino.\n\n" +
      "Vá para a seção de perfil e verifique.\n" +
      `\n${trainingMenu()}`
    );
  }

  const train = await generateTrain(user);
  const trainingPlan = convertToTrainingPlan(train, user.id);

  await setTrainingPlan(trainingPlan);
  await setSession(user.id, { step: "training_menu" });

  return `🚀 Treino novo criado com sucesso!\n\n${trainingMenu()}`;
}

export async function handleSeeWeeklyTraining(
  user: UserDoc,
  msg: string
): Promise<string> {
  const command = msg.trim().toLowerCase();

  if (command === "0") {
    await setSession(user.id, { step: "training_menu" });
    return trainingMenu();
  }

  const training = await getUserTraining(user.id);

  if (!training) {
    await setSession(user.id, { step: "training_menu" });
    return (
      "Você ainda não tem nenhum treino programado! " +
      "Digite *0* para voltar ao menu de treinos."
    );
  }

  const weekTraining = training.week;

  if (!weekTraining) {
    await setSession(user.id, { step: "training_menu" });
    return (
      "Não há treino programado para esta semana.\n\n" +
      "Digite *0* para voltar ao menu de treinos."
    );
  }

  // Monta texto formatado
  let trainingText = `📅 *Treino da Semana*\n`;

  for (const [day, dayTraining] of Object.entries(weekTraining)) {
    trainingText += `📌 ${day}: ${dayTraining.name}\n`;

    if (dayTraining.exercises.length > 0) {
      trainingText += "🏋️ *Exercícios*:\n";
      dayTraining.exercises.forEach((ex, idx) => {
        trainingText += `   ${idx + 1}. ${ex.name}\n`;
        trainingText += `      • Séries: ${ex.sets}\n`;
        trainingText += `      • Repetições: ${ex.reps}\n`;
        if (ex.restSeconds) {
          trainingText += `      • Descanso: ${ex.restSeconds}s\n`;
        }
        if (ex.notes) {
          trainingText += `      • Obs: ${ex.notes}\n`;
        }
      });
    } else {
      trainingText += "   Nenhum exercício cadastrado.\n";
    }
  }

  await setSession(user.id, { step: "training_menu" });

  return (
    `${trainingText}\n\nO que deseja fazer agora?\n` +
    "Digite *0* para voltar ao menu de treinos."
  );
}
