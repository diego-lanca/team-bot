import { Timestamp } from "firebase-admin/firestore";

export interface TrainingPlan {
  userId: string;
  week: {
    [day in WeekDay]?: DayTraining;
  };
  createdAt: FirebaseFirestore.Timestamp;
  updatedAt: FirebaseFirestore.Timestamp;
}

export type WeekDay =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export interface DayTraining {
  name: string; // Ex: "Treino A – Peito/Tríceps"
  exercises: Exercise[];
}

export interface Exercise {
  name: string; // "Supino Reto"
  sets?: number; // 4
  reps?: string; // "8–12"
  tempo_min?: string;
  tempo_seg?: string;
  restSeconds?: number; // 90
  notes?: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function convertToTrainingPlan(json: any, userId: string): TrainingPlan {
  const dayMap: Record<string, WeekDay> = {
    "Segunda-feira": "monday",
    "Terça-feira": "tuesday",
    "Quarta-feira": "wednesday",
    "Quinta-feira": "thursday",
    "Sexta-feira": "friday",
    "Sábado": "saturday",
    "Domingo": "sunday",
  };

  const week: TrainingPlan["week"] = {};

  for (const dia of json.plano_treino.dias) {
    const diaSemana = dia.dia || dia.dia_semana;

    const key = dayMap[diaSemana];
    if (!key) continue;

    week[key] = {
      name: dia.foco,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      exercises: dia.exercicios.map((ex: any) => {
        const cleaned: Exercise = {
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
