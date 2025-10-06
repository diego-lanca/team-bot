/* eslint-disable max-len */
// Integração com OpenIA
import OpenAI from "openai";
import { env } from "../config/env";
import { User, UserDoc } from "../models/user";
import { getUserTraining } from "./trainingPlanService";
import { TrainingPlan } from "../models/trainingPlan";
import { ChatSession } from "../models/chatSession";

const openai = new OpenAI({
  apiKey: env.OPENAI_KEY,
});

export const chatWithVirtualSpecialist = async (
  user: UserDoc,
  msg: string,
  chatSession: ChatSession
): Promise<string> => {
  const userTrain = (await getUserTraining(user.id)) ?? undefined;

  // Corrigimos a chamada para generateChatPrompt
  const promptText = generateChatPrompt(user, chatSession, msg, userTrain); // <-- MUDANÇA AQUI

  const response = await openai.responses.create({
    model: "gpt-5-nano",
    input: [
      {
        role: "developer",
        content: [
          {
            type: "input_text",
            text: promptText, // Usamos a variável com o prompt corrigido
          },
        ],
      },
    ],
    text: {
      format: {
        type: "text",
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

  return response.output_text;
};

export const generateDayMotivation = async (): Promise<string> => {
  const response = await openai.responses.create({
    model: "gpt-5-nano",
    input: [
      {
        role: "developer",
        content: [
          {
            type: "input_text",
            text: generateMotivationText,
          },
        ],
      },
    ],
    text: {
      format: {
        type: "text",
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

  return response.output_text;
};

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

const generateChatPrompt = (
  user: User,
  chat: ChatSession,
  msg: string, // <-- 1. Adicionamos o novo parâmetro aqui
  train?: TrainingPlan
): string => {
  // Construímos o histórico de forma explícita, adicionando a nova mensagem
  const fullHistoric = `${chat?.chatHistoric || ''}\nUsuário: ${msg}`;

  return `# Você é um Personal Trainer Virtual

Você conversa pelo WhatsApp ajudando com treinos, nutrição e hábitos saudáveis.

# IMPORTANTE: Leia TODO o Histórico Antes de Responder

Abaixo está o histórico COMPLETO da conversa, incluindo a última mensagem do usuário.

## Histórico da Conversa

\`\`\`
${fullHistoric} // <-- 2. Usamos o histórico completo com a nova mensagem
\`\`\`

# Informações do Usuário

\`\`\`json
{
  "usuario": {
    "idade": ${user.age},
    "sexo": ${user.sex},
    "altura_cm": ${user.height},
    "peso_kg": ${user.weight},
    "gordura_corporal_percent": ${user.bodyFatPercentage},
    "objetivo": ${user.goal},
    "nivel_atividade": ${user.activityLevel}
  },
  "plano_treino": {
    "dias_por_semana": ${5},
    "dias": ${train?.week}
  }
}
\`\`\`

# Como Você Deve Responder

1. **Leia o histórico acima** - veja o que já foi conversado
2. **Identifique a última mensagem do usuário** - é isso que você deve responder
3. **Responda APENAS o que foi perguntado** de forma direta e natural
4. **Use o contexto anterior** - se ele mencionou algo antes, considere isso

## Exemplos:

**Situação 1 - Primeira mensagem:**
Usuário: "Oi, tudo bem?"
Você: "Oi! Tudo ótimo, e você? Como posso ajudar? 💪"

**Situação 2 - Pergunta específica:**
Usuário: "Qual o melhor exercício para peito superior?"
Você: "Um dos melhores exercícios para o peito superior é o supino inclinado, seja com halteres ou com barra. Ele foca bem nessa porção do músculo."

## Regras:

✅ Seja direto e responda a pergunta
✅ Use tom natural e amigável  
✅ Mantenha respostas curtas (2-4 linhas para perguntas simples)
✅ Use *negrito* para ênfase quando necessário
✅ Considere SEMPRE o histórico da conversa

❌ NÃO ignore o histórico
❌ NÃO responda sempre a mesma coisa
❌ NÃO ofereça coisas não pedidas
❌ NÃO faça perguntas desnecessárias`;
};

const generateMotivationText = `
# Função
Crie uma mensagem motivacional diária direcionada a pessoas que praticam exercícios físicos, seguindo as instruções a seguir.

# Instruções
- Siga o checklist conceitual inicial antes de gerar a mensagem completa.
- A mensagem deve começar diretamente com a data do dia e um emoji pertinente.
- Elabore uma frase de motivação mais longa, apropriada ao público fitness.
- As dicas complementares devem ser mais curtas e objetivas.
- Adote raciocínio interno para aperfeiçoar a motivação e relevância de acordo com o público:
  - Não exponha raciocínio intermediário ou validação ao usuário, somente o resultado final.

## Checklist
1. Obtenha a data de hoje.
2. Elabore uma frase motivacional especial e mais extensa para praticantes de exercícios físicos.
3. Adicione informações úteis e relevantes, em formato reduzido, para este público.
4. Formate a mensagem conforme os padrões do WhatsApp.

## Elementos obrigatórios
A mensagem gerada deve necessariamente conter:
- Data do dia e um emoji pertinente logo no início;
- Frase motivacional específica e mais longa para quem faz exercícios físicos;
- Outras informações relevantes, em formato de dicas curtas, para este público.

## Formatação para WhatsApp
- Utilize emojis apropriados ao universo fitness, saúde e motivação;
- Mantenha o espaçamento adequado entre blocos;
- Insira quebras de linha para facilitar a leitura.

## Validação e autoajuste
Antes de concluir:
- Valide internamente se a mensagem está envolvente, motivacional, adequada ao público-alvo e pronta para compartilhamento no WhatsApp;
- Se algum elemento obrigatório estiver ausente, ajuste a mensagem antes de retornar.

- Ao final, retorne apenas o texto final da mensagem motivacional, sem validações, confirmações ou pensamentos intermediários. A mensagem pode ser mais curta no geral, mas com frase de motivação predominante.`;
