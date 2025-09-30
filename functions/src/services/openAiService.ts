// Integração com OpenIA
import OpenAI from "openai";
import { env } from "../config/env";
import { User } from "../models/user";

const openai = new OpenAI({
  apiKey: env.OPENAI_KEY,
});

export const generateTrain = async (user: User): Promise<object> => {
  const response = await openai.responses.create({
    model: "gpt-5-nano",
    input: [
      {
        role: "developer",
        content: [
          {
            type: "input_text",
            text: env.GENERATE_TRAIN_TEXT,
          },
        ],
      },
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: generateUserPrompt(user),
          },
        ],
      },
    ],
    text: {
      format: {
        type: "json_object",
      },
      verbosity: "medium",
    },
    reasoning: {
      effort: "medium",
    },
    tools: [],
    store: true,
    include: ["reasoning.encrypted_content"],
  });

  return JSON.parse(response.output_text);
};

const generateUserPrompt = (user: User): string => {
  if (!user.weight || !user.height) {
    return "";
  }

  const imc = (user.weight / (user.height * user.height)).toFixed(2);

  return (
    "Gerar treino para:\n" +
    `Idade: ${user.age}\n` +
    `Sexo: ${user.sex}\n` +
    `Altura: ${user.height}m\n` +
    `Peso: ${user.weight}kg\n` +
    `IMC: ${imc}\n` +
    (user.bodyFatPercentage
      ? `Gordura corporal: ${user.bodyFatPercentage}%\n`
      : "") +
    `Objetivo: ${user.goal}\n` +
    `Nível de atividade: ${user.activityLevel}\n` +
    `Dias por semana: ${5}`
  );
};
