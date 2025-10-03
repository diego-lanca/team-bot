// import { nutritionMenu } from "../bot/flows/nutritionMenu";
// import { UserDoc } from "../models/user";
// import { setSession } from "../services/firestoreService";

// export function handleNutritionOptions(): Record<
//   string,
//   (user: UserDoc, msg: string) => Promise<string>
//   > {
//   return {
//     see_nutrition_confirm: handleSeeTraining,
//     generate_nutrition_confirm: handleGenerateTrainings,
//   };
// }

// export async function handleSeeNutrition(
//   user: UserDoc,
//   msg: string
// ): Promise<string> {
//   const command = msg.trim().toLowerCase();

//   if (command === "0") {
//     await setSession(user.id, { step: "nutrition_menu" });
//     return nutritionMenu();
//   }

//   const nutrition = await getUserNutrition(user.id);

//   if (!nutrition) {
//     await setSession(user.id, { step: "nutrition_menu" });
//     return (
//       "Você ainda não tem nenhum treino programado! " +
//       "Digite *0* para voltar ao menu de treinos."
//     );
//   }

//   const today = new Date();
//   const weekDay = today.getDay(); // 0=domingo ... 6=sábado

//   // Mapeia para WeekDay + tradução
//   const daysMap: { [key: number]: { key: WeekDay; label: string } } = {
//     0: { key: "sunday", label: "Domingo" },
//     1: { key: "monday", label: "Segunda-feira" },
//     2: { key: "tuesday", label: "Terça-feira" },
//     3: { key: "wednesday", label: "Quarta-feira" },
//     4: { key: "thursday", label: "Quinta-feira" },
//     5: { key: "friday", label: "Sexta-feira" },
//     6: { key: "saturday", label: "Sábado" },
//   };

//   const dayInfo = daysMap[weekDay];
//   const dayTraining = training.week[dayInfo.key];

//   if (!dayTraining) {
//     await setSession(user.id, { step: "training_menu" });
//     return (
//       `Não há treino programado para ${dayInfo.label}.\n\n` +
//       "Digite *0* para voltar ao menu de treinos."
//     );
//   }

//   // Monta texto formatado
//   let trainingText = `📅 *${dayInfo.label}*\n`;
//   trainingText += `📌 Treino: ${dayTraining.name}\n\n`;

//   if (dayTraining.exercises.length > 0) {
//     trainingText += "🏋️ *Exercícios*:\n";
//     dayTraining.exercises.forEach((ex, idx) => {
//       trainingText += `   ${idx + 1}. ${ex.name}\n`;
//       trainingText += `      • Séries: ${ex.sets}\n`;
//       trainingText += `      • Repetições: ${ex.reps}\n`;
//       if (ex.restSeconds) {
//         trainingText += `      • Descanso: ${ex.restSeconds}s\n`;
//       }
//       if (ex.notes) {
//         trainingText += `      • Obs: ${ex.notes}\n`;
//       }
//     });
//   } else {
//     trainingText += "   Nenhum exercício cadastrado.\n";
//   }

//   await setSession(user.id, { step: "training_menu" });

//   return (
//     `${trainingText}\n\nO que deseja fazer agora?\n` +
//     "Digite *0* para voltar ao menu de treinos."
//   );
// }
