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
