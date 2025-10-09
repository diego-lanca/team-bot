/* eslint-disable max-len */
// Integração com OpenIA
import OpenAI from "openai";
import { env } from "../config/env";
import { User, UserDoc } from "../models/user";
import { getUserTraining } from "./trainingPlanService";
import { TrainingPlan } from "../models/trainingPlan";
import { ChatSession } from "../models/chatSession";
import axios from "axios";

const openai = new OpenAI({
  apiKey: env.OPENAI_KEY,
});

export const chatWithVirtualSpecialist = async (
  user: UserDoc,
  msg: string,
  chatSession: ChatSession
): Promise<string> => {
  const userTrain = (await getUserTraining(user.id)) ?? undefined;

  const promptText = generateChatPrompt(user, chatSession, msg, userTrain);

  const response = await openai.responses.create({
    model: "gpt-5-nano",
    input: [
      {
        role: "developer",
        content: [
          {
            type: "input_text",
            text: promptText,
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

export const getUserMessage = async (
  msg: string,
  media?: string,
  contentType?: string
): Promise<string> => {
  if (contentType === "audio/ogg" && media) {
    // Baixar áudio do Twilio
    const response = await axios.get(media, {
      responseType: "arraybuffer",
      auth: {
        username: env.TWILIO_SID,
        password: env.TWILIO_AUTH,
      },
    });

    if (!response.data) {
      throw new Error(`Falha ao baixar áudio do Twilio: ${response.status}`);
    }

    const buffer = Buffer.from(response.data);

    const file = new File([buffer], "audio.ogg", { type: contentType });

    const transcription = await openai.audio.transcriptions.create({
      file: file,
      model: "gpt-4o-mini-transcribe",
      language: "pt",
    });

    console.log(transcription.text);

    return transcription.text;
  }

  return msg;
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

export const generateTrain = async (
  user: User,
  days: number
): Promise<object> => {
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
            text: generateUserPrompt(user, days),
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

  console.log(response.output_text);

  return JSON.parse(response.output_text);
};

const generateUserPrompt = (user: User, days: number): string => {
  if (!user.weight || !user.height) {
    throw new Error("Peso e altura são obrigatórios para gerar o treino.");
  }

  const imc = (user.weight / (user.height * user.height)).toFixed(2);

  console.log(`Gerando treino para: ${days} dias`);

  return `{
idade: ${user.age},
sexo: ${user.sex},
altura: ${user.height},
peso: ${user.weight},
imc: ${imc},
nivel_atividade: ${user.activityLevel}
objetivo: ${user.goal},
dias_por_semana: ${days},
gordura_corporal_percent: ${user.bodyFatPercentage},
injuries: ${user.injuries},
medical_conditions: ${user.medicalConditions},
medications: ${user.medications},
}`;
};

const generateChatPrompt = (
  user: User,
  chat: ChatSession,
  msg: string, // <-- 1. Adicionamos o novo parâmetro aqui
  train?: TrainingPlan
): string => {
  // Construímos o histórico de forma explícita, adicionando a nova mensagem
  const fullHistoric = `${chat?.chatHistoric || ""}\nUsuário: ${msg}`;

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
    "condicoes_medicas": ${user.medicalConditions || []},
    "lesoes": ${user.injuries || []},
    "medicamentos": ${user.medications || []}
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

const generateMotivationText = `# Função
Crie uma mensagem motivacional diária direcionada a pessoas que praticam exercícios físicos, seguindo as orientações abaixo.

# Instruções
- Inicie apresentando um checklist conceitual e sucinto de 3 a 7 itens do processo que seguirá antes de gerar a mensagem, apenas de forma interna e sem expor ao usuário.
- A mensagem deve começar com a data atual e um emoji pertinente ao contexto fitness.
- Construa uma frase de motivação curta e envolvente, adaptada ao público praticante de exercícios físicos.
- Inclua até 2 dicas complementares em frases curtas e objetivas, focadas na especificidade desse público.
- Realize todo raciocínio e validação de adequação e motivação internamente, sem expor raciocínio intermediário, autoavaliação ou etapas ao usuário.
- Ajuste autonomamente qualquer elemento obrigatório que esteja ausente antes de retornar o resultado final.

## Checklist Conceitual (executado internamente)
1. Obtenha a data atual.
2. Planeje a mensagem motivacional principal.
3. Selecione até 2 dicas complementares relevantes e objetivas.
4. Escolha emojis apropriados ao universo fitness/saúde/motivação.
5. Formate conforme os padrões do WhatsApp (espaçamento, quebras de linha, blocos claros).

## Elementos obrigatórios
- Data atual e emoji pertinente no início;
- Frase motivacional curta dedicada a quem pratica exercícios físicos;
- Até 2 dicas curtas e relevantes para esse público.

## Formatação para WhatsApp
- Use emojis relacionados ao universo fitness, saúde e motivação;
- Mantenha espaçamento visualmente agradável entre blocos;
- Insira quebras de linha para facilitar a leitura.

## Validação e retorno
- Após compor a mensagem, valide internamente se está envolvente, motivacional e adequada ao público fitness, pronta para WhatsApp.
- Só retorne o texto final da mensagem motivacional, sem confirmações, validações ou pensamentos intermediários como saída.
- Se algum elemento obrigatório estiver ausente, corrija a mensagem antes de apresentar o resultado final.
- A mensagem deve ser sempre breve, com a frase de motivação curta predominando e no máximo 2 dicas.`;
