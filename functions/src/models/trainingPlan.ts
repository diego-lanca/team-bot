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
