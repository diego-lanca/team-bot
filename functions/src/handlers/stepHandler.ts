import { askAge } from "../bot/flows/askAge";
import { mainMenu } from "../bot/flows/mainMenu";
import { profileMenu } from "../bot/flows/profileMenu";
import { UserDoc } from "../models/user";
import { setSession } from "../services/firestoreService";
import { setUser } from "../services/userService";
import { parseAge } from "../utils/utils";
import { trainingMenu } from "../bot/flows/trainingMenu";

export async function handleName(user: UserDoc, msg: string): Promise<string> {
  const userName = msg.trim();
  await setUser(user.id, { name: userName });
  await setSession(user.id, { step: "ask_age" });
  return askAge({ ...user, name: userName });
}

export async function handleAge(user: UserDoc, msg: string): Promise<string> {
  const age = parseAge(msg);
  if (age === null || age < 12 && age > 100) {
    return "Por favor, digite um número válido para a sua idade.";
  }

  await setUser(user.id, { age });
  await setSession(user.id, { step: "main_menu" });
  return (
    `Legal! Idade ${age} registrada com sucesso.\n` +
    "Agora você está pronto para começar!\n\n" +
    mainMenu()
  );
}

export async function handleMenu(user: UserDoc, msg: string): Promise<string> {
  const option = msg.trim().toLowerCase();

  const mapping: Record<string, { step: string; text: string }> = {
    "1": {
      step: "training_menu",
      text: trainingMenu(),
    },
    "2": {
      step: "nutrition_menu",
      text: "Você escolheu: Plano Alimentar.",
    },
    "3": {
      step: "virtual_specialist_menu",
      text: "Você escolheu: Falar com Especialista Virtual.",
    },
    "4": {
      step: "profile_menu",
      text: profileMenu(),
    },
  };

  const choice = mapping[option] || mapping[msg.toLowerCase()];
  if (!choice) {
    return (
      "Opção inválida. Por favor, digite um número de 1 a 4.\n\n" + mainMenu()
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
      question: `📝 Nome atual: ${user.name ?? "—"}\nDigite o novo nome:`,
    },
    "2": {
      step: "edit_age",
      question: `${
        user.age ? `🎂 Idade atual: ${user.age}\n` : ""
      }Digite sua idade:`,
    },
    "3": {
      step: "edit_sex",
      question: `${
        user.sex ? `⚧ Sexo atual: ${user.sex}\n` : ""
      }Digite *M* para Masculino ou *F* para Feminino:`,
    },
    "4": {
      step: "edit_height",
      question: `${
        user.height ? `📏 Altura atual: ${user.height} m\n` : ""
      }Digite sua altura em metros (ex: 1.75):`,
    },
    "5": {
      step: "edit_weight",
      question: `${
        user.weight ? `⚖️ Peso atual: ${user.weight} kg\n` : ""
      }Digite seu peso em kg (ex: 70):`,
    },
    "6": {
      step: "edit_bodyfat",
      question: `${
        user.bodyFatPercentage
          ? `💪 Gordura corporal atual: ${user.bodyFatPercentage}%\n`
          : ""
      }Digite sua % de gordura corporal:`,
    },
    "7": {
      step: "edit_goal",
      question:
        `${
          user.goal ? `🎯 Meta atual: ${user.goal}\n` : ""
        }Escolha sua meta:\n1️⃣ Perda de peso\n2️⃣ Ganho de massa\n` +
        "3️⃣ Resistência\n4️⃣ Saúde geral",
    },
    "8": {
      step: "edit_activity",
      question:
        `${
          user.activityLevel
            ? `🏃‍♂️ Nível de atividade atual: ${user.activityLevel}\n`
            : ""
        }Escolha seu nível de atividade:\n1️⃣ Sedentário\n2️⃣ Leve\n` +
        "3️⃣ Moderado\n4️⃣ Intenso",
    },
    "9": {
      step: "edit_conditions",
      question: `${
        user.medicalConditions
          ? `🩺 Condições médicas atuais: ${user.medicalConditions}\n`
          : ""
      }Liste condições médicas relevantes: (ex: Diabetes, Hipertensão)`,
    },
    "10": {
      step: "edit_injuries",
      question: `${
        user.injuries ? `🤕 Lesões registradas: ${user.injuries}\n` : ""
      }Informe lesões atuais ou anteriores: (ex: Ombro esquerdo, Mão direita)`,
    },
    "11": {
      step: "edit_medications",
      question: `${
        user.medications ? `💊 Medicamentos em uso: ${user.medications}\n` : ""
      }Liste medicamentos em uso:`,
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

export async function handleTrainingMenu(
  user: UserDoc,
  msg: string
): Promise<string> {
  const option = msg.trim().match(/\d+/)?.[0] || "";

  const mapping: Record<string, { step: string; question: string }> = {
    "1": {
      step: "see_training_confirm",
      question:
        `Ok, ${user.name}! Vou buscar seu treino atual. 👍\n` +
        `Posso prosseguir? Digite "sim" ou "confirmo".`,
    },
    "2": {
      step: "generate_training_confirm",
      question:
        `Perfeito! Estou pronto para criar um novo treino incrível para você.` +
        ` 💪\nVamos começar? Digite "sim" ou "confirmo".`,
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
    return `Opção inválida, ${user.name}. Por favor, ` +
    `escolha uma das opções disponíveis: ${validOptions}.`;
  }

  await setSession(user.id, { step: choice.step });
  return choice.question;
}

export async function handleNutritionMenu(
  user: UserDoc,
  msg: string
): Promise<string> {
  const option = msg.trim().match(/\d+/)?.[0] || "";

  const mapping: Record<string, { step: string; question: string }> = {
    "1": {
      step: "see_daily_plan_confirm",
      question:
        `Ok, ${user.name}! Vou buscar seu plano alimentar de hoje. 👍\n` +
        `Posso continuar? Digite "sim" para confirmar.`,
    },
    "2": {
      step: "see_weekly_plan_confirm",
      question:
        `Certo! Preparando para exibir o plano da semana toda. 📅\n` +
        `Podemos prosseguir? Digite "sim" para confirmar.`,
    },
    "3": {
      step: "see_substitutions_confirm",
      question:
        `Boa! Vou carregar a lista de substituições de alimentos. 🥦\n` +
        `Confirma? Digite "sim".`,
    },
    "0": {
      step: "main_menu",
      question: mainMenu(),
    },
  };

  // Procura a escolha do usuário no mapeamento
  const choice = mapping[option];

  if (!choice) {
    const validOptions = Object.keys(mapping)
      .map((key) => `"${key}"`)
      .join(", ");
    return `Opção inválida, ${user.name}.` +
    `Por favor, escolha uma das opções disponíveis: ${validOptions}.`;
  }

  // Atualiza a sessão do usuário com o novo passo
  await setSession(user.id, { step: choice.step });

  // Retorna a pergunta/resposta correspondente
  return choice.question;
}

export async function handleVirtualSpecialistMenu(
  user: UserDoc,
  msg: string
): Promise<string> {
  return (
    "Seção de Especialista Virtual em construção." +
    'Por favor, volte mais tarde.\n\n' +
    mainMenu()
  );
}
