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
  sets: number; // 4
  reps: string; // "8–12"
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
    const diaSemana = dia.dia === "" ? dia.dia_semana : dia.dia;

    const key = dayMap[diaSemana];
    if (!key) continue;

    week[key] = {
      name: dia.foco,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      exercises: dia.exercicios.map((ex: any) => ({
        name: ex.nome,
        sets: ex.series,
        reps: ex.repeticoes,
        restSeconds: ex.descanso_seg,
      })),
    };
  }

  return {
    userId,
    week,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };
}
