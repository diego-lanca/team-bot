import { Timestamp } from "firebase-admin/firestore";
import { WeekDay } from "./trainingPlan";

export interface HomeTrainingPlan {
  userId: string;
  week: {
    [day in WeekDay]?: HomeDayTraining;
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface HomeDayTraining {
  name: string; // Ex: "Treino A – Core"
  exercises: HomeExercise[];
}

export interface HomeExercise {
  name: string; // "Prancha"
  sets?: number; // 3
  reps?: string; // "30–60s"
  tempo_min?: string;
  tempo_seg?: string;
  restSeconds?: number;
  notes?: string;
  isBodyweight?: boolean; // true se não precisa de equipamento
}

export function convertToHomeTrainingPlan(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  json: any,
  userId: string
): HomeTrainingPlan {
  const dayMap: Record<string, WeekDay> = {
    "Segunda-feira": "monday",
    "Terça-feira": "tuesday",
    "Quarta-feira": "wednesday",
    "Quinta-feira": "thursday",
    "Sexta-feira": "friday",
    "Sábado": "saturday",
    "Domingo": "sunday",
  };

  const week: HomeTrainingPlan["week"] = {};

  for (const dia of json.plano_treino.dias) {
    const diaSemana = dia.dia || dia.dia_semana;

    const key = dayMap[diaSemana];
    if (!key) continue;

    week[key] = {
      name: dia.foco,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      exercises: dia.exercicios.map((ex: any) => {
        const cleaned: HomeExercise = {
          name: ex.nome,
        };

        if (ex.series !== undefined) cleaned.sets = ex.series;
        if (ex.repeticoes !== undefined) cleaned.reps = ex.repeticoes;
        if (ex.tempo_min !== undefined) cleaned.tempo_min = ex.tempo_min;
        if (ex.tempo_seg !== undefined) cleaned.tempo_seg = ex.tempo_seg;
        if (ex.descanso_seg !== undefined) {
          cleaned.restSeconds = ex.descanso_seg;
        }

        return cleaned;
      }),
    };
  }

  return {
    userId,
    week,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };
}
