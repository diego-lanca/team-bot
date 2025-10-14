import { UserDoc } from "../models/user";
import { hasRequiredInfos } from "../services/userService";
import { generateHomeTrain } from "../services/openAiService";
import { WeekDay } from "../models/trainingPlan";
import { setSession } from "../services/firestoreService";
import { trainingMenu } from "../bot/flows/trainingMenu";
import { sendMessage } from "../services/twilioService";
import { trainingHome } from "../bot/flows/trainingHome";
import {
  getUserHomeTraining,
  setHomeTrainingPlan,
} from "../services/homeTrainingService";
import {
  convertToHomeTrainingPlan,
  HomeTrainingPlan,
} from "../models/homeTraining";

export function handleHomeTrainingOptions(): Record<
  string,
  (user: UserDoc, msg: string) => Promise<{ msg: string; mediaUrl?: string }>
  > {
  return {
    see_home_training_confirm: handleSelectHomeTrainingDay,
    generate_home_train: handleGenerateHomeTrainings,
  };
}

export async function handleSelectHomeTrainingDay(
  user: UserDoc,
  msg: string
): Promise<{ msg: string; mediaUrl?: string }> {
  const command = msg.trim().toLowerCase();

  if (command === "0") {
    await setSession(user.id, { step: "home_training_menu" });
    return { msg: trainingHome() };
  }

  const training = await getUserHomeTraining(user.id);
  if (!training) {
    await setSession(user.id, { step: "home_training_menu" });
    return {
      msg: "Você ainda não tem nenhum treino programado!\n" + trainingHome(),
    };
  }

  const daysArray = Object.entries(training.week).map(([key, day]) => ({
    key,
    ...day,
  }));

  const selectedIdx = parseInt(command) - 1;
  if (
    isNaN(selectedIdx) ||
    selectedIdx < 0 ||
    selectedIdx >= daysArray.length
  ) {
    return { msg: "Opção inválida. Digite o número do treino que deseja ver." };
  }

  const selectedDay = daysArray[selectedIdx];

  // Monta texto do treino selecionado
  let trainingText = `📌 Treino: ${selectedDay.name}\n\n`;

  if (selectedDay.exercises.length > 0) {
    trainingText += "🏋️ *Exercícios*:\n";
    selectedDay.exercises.forEach((ex, idx) => {
      trainingText += `   ${idx + 1}. ${ex.name}\n`;
      if (ex.sets) trainingText += `      • Séries: ${ex.sets}\n`;
      if (ex.reps) trainingText += `      • Repetições: ${ex.reps}\n`;
      if (ex.tempo_min) trainingText += `      • Tempo: ${ex.tempo_min} mins\n`;
      if (ex.tempo_seg) trainingText += `      • Tempo: ${ex.tempo_seg} segs\n`;
      if (ex.restSeconds) {
        trainingText += `      • Descanso: ${ex.restSeconds}s\n`;
      }
      if (ex.notes) trainingText += `      • Obs: ${ex.notes}\n`;
    });
  } else {
    trainingText += "   Nenhum exercício cadastrado.\n";
  }

  await setSession(user.id, { step: "home_training_menu" });

  return {
    msg:
      `${trainingText}\n` +
      "❓ *Em caso de dúvidas, fale com um dos instrutores!* 💬\n\n" +
      trainingHome(),
  };
}

export function getUserTodayHomeTrain(training: HomeTrainingPlan): string {
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
    return `Não há treino programado para ${dayInfo.label}.`;
  }

  // Monta texto formatado
  let trainingText = `📅 *${dayInfo.label}*\n`;
  trainingText += `📌 Treino: ${dayTraining.name}\n\n`;

  if (dayTraining.exercises.length > 0) {
    trainingText += "🏋️ *Exercícios*:\n";
    dayTraining.exercises.forEach((ex, idx) => {
      trainingText += `   ${idx + 1}. ${ex.name}\n`;
      if (ex.sets) trainingText += `      • Séries: ${ex.sets}\n`;
      if (ex.reps) trainingText += `      • Repetições: ${ex.reps}\n`;
      if (ex.tempo_min) trainingText += `      • Tempo: ${ex.tempo_min} mins\n`;
      if (ex.tempo_seg) trainingText += `      • Tempo: ${ex.tempo_seg} segs\n`;
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

  return (
    trainingText +
    "\n\n" +
    "❓ *Em caso de dúvidas, fale com um dos instrutores!* 💬"
  );
}

export async function handleGenerateHomeTrainings(
  user: UserDoc,
  msg: string
): Promise<{ msg: string; mediaUrl?: string }> {
  const command = msg.trim().toLowerCase();

  if (command === "0") {
    await setSession(user.id, { step: "home_training_menu" });
    return { msg: trainingHome() };
  }

  const days = parseInt(command);

  if (days < 1 && days > 7) {
    return {
      msg:
        "Não entendi sua resposta. Por favor, digite um número válido de dias" +
        ' para criar um novo treino ou "0" para voltar.',
    };
  }

  const requiredInfos = hasRequiredInfos(user);
  if (!requiredInfos) {
    await setSession(user.id, { step: "home_training_menu" });
    return {
      msg:
        "Você ainda não completou todas as informações " +
        "necessárias pra gerar um treino.\n\n" +
        "Vá para a seção de perfil e verifique.\n" +
        `\n${trainingHome()}`,
    };
  }

  await sendMessage(
    user.phone,
    "🤖💪 Gerando seu treino personalizado com nosso especialista virtual..." +
      "⏳ Aguarde um instante e já já estará pronto para você!"
  );

  const train = await generateHomeTrain(user, days);
  const homePrainingPlan = convertToHomeTrainingPlan(train, user.id);

  await setHomeTrainingPlan(homePrainingPlan, user.id);
  await setSession(user.id, { step: "home_training_menu" });

  return { msg: `🚀 Treino novo criado com sucesso!\n\n${trainingMenu()}` };
}
