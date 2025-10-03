// import { Timestamp } from "firebase-admin/firestore";

// export interface NutritionPlan {
//   userId?: string;
//   title: string;
//   description?: string;
//   createdBy: string; // userId do nutricionista / treinador
//   assignedTo?: string; // userId do paciente/cliente
//   createdAt?: Date | Timestamp;
//   updatedAt?: Date | Timestamp;
//   meals: Meal[]; // plano diário ou repetível
//   macros?: MacroTargets;
//   goals?: NutritionGoal[];
//   restrictions?: string[]; // ex: ["gluten", "lactose"]
//   allergies?: string[]; // ex: ["amendoim"]
//   notes?: string;
// }

// export type NutritionGoal =
//   | "lose_weight"
//   | "gain_muscle"
//   | "maintenance"
//   | "improve_health";

// export interface MacroTargets {
//   calories?: number;
//   proteinG?: number;
//   carbsG?: number;
//   fatsG?: number;
// }

// export type MealTime =
//   | "breakfast"
//   | "mid_morning"
//   | "lunch"
//   | "afternoon"
//   | "dinner"
//   | "snack";

// export interface MealItem {
//   name: string;
//   quantity: string; // ex: "150g", "1 unidade"
//   calories?: number;
//   proteinG?: number;
//   carbsG?: number;
//   fatsG?: number;
//   notes?: string;
// }

// export interface Meal {
//   id?: string;
//   time: MealTime;
//   items: MealItem[];
//   totalCalories?: number;
//   notes?: string;
// }
