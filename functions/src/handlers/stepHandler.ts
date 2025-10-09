import { mainMenu } from "../bot/flows/mainMenu";
import { profileMenu } from "../bot/flows/profileMenu";
import { UserDoc } from "../models/user";
import { setSession } from "../services/firestoreService";
import { getUserHourTraining, setUser } from "../services/userService";
import { trainingMenu } from "../bot/flows/trainingMenu";
import { virtualSpecialistMenu } from "../bot/flows/virtualSpecialistMenu";
import { virtualSpecialistChat } from "./virtualSpecialistHandler";
import {
  getUserTraining,
  getUserTrainings,
  getWeeklyUserTrainings,
} from "../services/trainingPlanService";
import { scheduleMessage } from "../services/twilioService";

export async function handleMenu(user: UserDoc, msg: string): Promise<string> {
  const option = msg.trim().toLowerCase();

  const mapping: Record<string, { step: string; text: string }> = {
    "1": {
      step: "training_menu",
      text: trainingMenu(),
    },
    // "2": {
    //   step: "nutrition_menu",
    //   text: "Você escolheu: Plano Alimentar.",
    // },
    "2": {
      step: "virtual_specialist_menu",
      text: virtualSpecialistMenu(),
    },
    "3": {
      step: "profile_menu",
      text: profileMenu(),
    },
  };

  const choice = mapping[option] || mapping[msg.toLowerCase()];
  if (!choice) {
    return (
      "Opção inválida. Por favor, digite um número de 1 a 3.\n\n" + mainMenu()
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
    "1": {
      step: "edit_name",
      question: `📝 Nome atual: ${
        user.name ?? "—"
      }\nDigite o novo nome ou *0* pra cancelar:`,
    },
    "2": {
      step: "edit_age",
      question: `${
        user.age ? `🎂 Idade atual: ${user.age}\n` : ""
      }Digite sua idade ou *0* pra cancelar:`,
    },
    "3": {
      step: "edit_sex",
      question: `${
        user.sex ? `⚧ Sexo atual: ${user.sex}\n` : ""
      }Digite *M* para Masculino, *F* para Feminino ou *0* pra cancelar :`,
    },
    "4": {
      step: "edit_height",
      question: `${
        user.height ? `📏 Altura atual: ${user.height} m\n` : ""
      }Digite sua altura em metros (ex: 1.75) ou *0* pra cancelar:`,
    },
    "5": {
      step: "edit_weight",
      question: `${
        user.weight ? `⚖️ Peso atual: ${user.weight} kg\n` : ""
      }Digite seu peso em kg (ex: 70) ou *0* pra cancelar:`,
    },
    "6": {
      step: "edit_bodyfat",
      question: `${
        user.bodyFatPercentage
          ? `💪 Gordura corporal atual: ${user.bodyFatPercentage}%\n`
          : ""
      }Digite sua % de gordura corporal ou *0* pra cancelar:`,
    },
    "7": {
      step: "edit_goal",
      question:
        `${
          user.goal ? `🎯 Meta atual: ${user.goal}\n` : ""
        }Escolha sua meta:\n0️⃣ Cancelar\n1️⃣ Perda de peso\n` +
        "2️⃣ Ganho de massa\n3️⃣ Resistência\n4️⃣ Saúde geral",
    },
    "8": {
      step: "edit_activity",
      question:
        `${
          user.activityLevel
            ? `🏃‍♂️ Nível de atividade atual: ${user.activityLevel}\n`
            : ""
        }Escolha seu nível de atividade:\n0️⃣ Cancelar\n` +
        "1️⃣ Sedentário\n2️⃣ Leve\n3️⃣ Moderado\n4️⃣ Intenso",
    },
    "9": {
      step: "edit_conditions",
      question:
        `${
          user.medicalConditions
            ? `🩺 Condições médicas atuais: ${user.medicalConditions}\n`
            : ""
        }Liste condições médicas relevantes: ` +
        "(ex: Diabetes, Hipertensão) ou *0* pra cancelar",
    },
    "10": {
      step: "edit_injuries",
      question:
        `${
          user.injuries ? `🤕 Lesões registradas: ${user.injuries}\n` : ""
        }Informe lesões atuais ou anteriores: ` +
        "(ex: Ombro esquerdo, Mão direita) ou *0* pra cancelar",
    },
    "11": {
      step: "edit_medications",
      question: `${
        user.medications ? `💊 Medicamentos em uso: ${user.medications}\n` : ""
      }Liste medicamentos em uso ou *0* pra cancelar:`,
    },
    "12": {
      step: "edit_training_preference", // Novo passo na conversa
      question:
        "Você prefere receber seu treino diário de que forma?\n\n" +
        "1️⃣ *Automática*: Eu te envio o treino específico do dia " +
        "(ex: Treino A).\n" +
        "2️⃣ *Manual*: Eu te envio as opções e você escolhe qual treinar" +
        " (ex: A, B ou C).\n\n" +
        "Digite *1* ou *2* (ou *0* para voltar).",
    },
    "13": {
      step: "edit_training_hour", // Novo passo na conversa
      question:
        "⏰ Qual é o seu *horário preferido* para treinar?\n\n" +
        "Digite no formato *HH:MM* (ex: *17:30*).\n\n" +
        "🏋️ Assim posso te lembrar e enviar seu treino na hora certa!\n\n" +
        "Digite *0* para voltar.",
    },
    "0": {
      step: "main_menu",
      question: mainMenu(),
    },
  };

  const choice = mapping[option];
  if (!choice) return "Opção inválida. Digite um número de 1 a 12.";

  await setSession(user.id, { step: choice.step });
  return choice.question;
}

export async function handleEditName(
  user: UserDoc,
  msg: string
): Promise<string> {
  if (msg.trim() == "0") {
    await setSession(user.id, { step: "profile_menu" });
    return profileMenu();
  }

  const newName = msg.trim();

  if (!newName) {
    return "Nome inválido. Por favor, digite um nome válido.";
  }

  await setUser(user.id, { name: newName });

  await setSession(user.id, { step: "profile_menu" });

  return (
    `✅ Nome atualizado para *${newName}*! ` +
    'Digite "0" para voltar ao menu principal.'
  );
}

export async function handleEditAge(
  user: UserDoc,
  msg: string
): Promise<string> {
  if (msg.trim() == "0") {
    await setSession(user.id, { step: "profile_menu" });
    return profileMenu();
  }

  const newAge = parseInt(msg.trim(), 10);

  if (isNaN(newAge) || newAge < 10 || newAge > 100) {
    return "Idade inválida. Por favor, digite apenas números (ex: 30).";
  }

  await setUser(user.id, { age: newAge });

  await setSession(user.id, { step: "profile_menu" });

  return (
    `✅ Idade atualizada para *${newAge} anos*! ` +
    'Digite "0" para voltar ao menu principal.'
  );
}

export async function handleTrainingMenu(
  user: UserDoc,
  msg: string
): Promise<string> {
  const option = msg.trim().match(/\d+/)?.[0] || "";

  const mapping: Record<string, { step: string; question: string }> = {
    "1": {
      step: "see_training_confirm",
      question: await getUserTrainings(user),
    },
    "2": {
      step: "generate_train",
      question:
        `Legal! Para criar um treino perfeito para você, me diga: ` +
        `*quantos dias na semana você pretende treinar?* 🤔\n\n` +
        `Por favor, digite um número de 1 a 7. (ou "0" para voltar)`,
    },
    "3": {
      step: "see_weekly_training_confirm",
      question: (await getWeeklyUserTrainings(user)) + trainingMenu(),
    },
    "0": {
      step: "main_menu",
      question: mainMenu(),
    },
  };

  const choice = mapping[option];

  if (!choice) {
    const validOptions = Object.keys(mapping)
      .map((key) => `"${key}"`)
      .join(", ");
    return (
      `Opção inválida, ${user.name}. Por favor, ` +
      `escolha uma das opções disponíveis: ${validOptions}.`
    );
  }

  await setSession(user.id, { step: choice.step });
  return choice.question;
}

// export async function handleNutritionMenu(
//   user: UserDoc,
//   msg: string
// ): Promise<string> {
//   const option = msg.trim().match(/\d+/)?.[0] || "";

//   const mapping: Record<string, { step: string; question: string }> = {
//     "1": {
//       step: "see_daily_plan_confirm",
//       question:
//         `Ok, ${user.name}! Vou buscar seu plano alimentar de hoje. 👍\n` +
//         `Posso continuar? Digite "sim" para confirmar.`,
//     },
//     "2": {
//       step: "see_weekly_plan_confirm",
//       question:
//         `Certo! Preparando para exibir o plano da semana toda. 📅\n` +
//         `Podemos prosseguir? Digite "sim" para confirmar.`,
//     },
//     "3": {
//       step: "see_substitutions_confirm",
//       question:
//         `Boa! Vou carregar a lista de substituições de alimentos. 🥦\n` +
//         `Confirma? Digite "sim".`,
//     },
//     "0": {
//       step: "main_menu",
//       question: mainMenu(),
//     },
//   };

//   const choice = mapping[option];

//   if (!choice) {
//     const validOptions = Object.keys(mapping)
//       .map((key) => `"${key}"`)
//       .join(", ");
//     return (
//       `Opção inválida, ${user.name}.` +
//       `Por favor, escolha uma das opções disponíveis: ${validOptions}.`
//     );
//   }

//   await setSession(user.id, { step: choice.step });

//   return choice.question;
// }

export async function handleVirtualSpecialistMenu(
  user: UserDoc,
  msg: string,
  media?: string,
  contentType?: string
): Promise<string> {
  const command = parseInt(msg.trim());

  if (command === 0) {
    await setSession(user.id, { step: "main_menu" });
    return mainMenu();
  }

  const response = await virtualSpecialistChat(user, msg, media, contentType);

  return response;
}

export async function handleSelectDailyTraining(
  user: UserDoc,
  msg: string
): Promise<string> {
  const command = msg.trim().toLowerCase();

  const training = await getUserTraining(user.id);
  if (!training) {
    await setSession(user.id, { step: "training_menu" });
    return "Você ainda não tem nenhum treino programado!\n" + trainingMenu();
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
    return "Opção inválida. Digite o número do treino que deseja ver.";
  }

  const selectedDay = daysArray[selectedIdx];

  // Monta texto do treino selecionado
  let trainingText = `📌 Treino: ${selectedDay.name}\n\n`;

  if (selectedDay.exercises.length > 0) {
    trainingText += "🏋️ *Exercícios*:\n";
    selectedDay.exercises.forEach((ex, idx) => {
      trainingText += `   ${idx + 1}. ${ex.name}\n`;
      trainingText += `      • Séries: ${ex.sets}\n`;
      trainingText += `      • Repetições: ${ex.reps}\n`;
      if (ex.restSeconds) {
        trainingText += `      • Descanso: ${ex.restSeconds}s\n`;
      }
      if (ex.notes) trainingText += `      • Obs: ${ex.notes}\n`;
    });
  } else {
    trainingText += "   Nenhum exercício cadastrado.\n";
  }

  await setSession(user.id, { step: "main_menu" });

  await scheduleMessage(
    user.phone,
    "💪 Bora pro treino de hoje!\n" +
      "Nada de deixar pra depois — seu corpo e sua mente vão " +
      "te agradecer depois.\n🔥 Só depende de você!" +
      trainingText,
    getUserHourTraining(user)
  );

  return `${trainingText}\n\n` + mainMenu();
}
