import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { TrainingPlan } from "../models/trainingPlan";
import { UserDoc } from "../models/user";
import { trainingMenu } from "../bot/flows/trainingMenu";

const db = getFirestore();
const trainingsRef = db.collection("trainings");

export async function getUserTraining(
  userId: string
): Promise<TrainingPlan | null> {
  const snapshot = await trainingsRef
    .where("userId", "==", userId)
    .limit(1)
    .get();

  if (snapshot.empty) return null;
  return snapshot.docs[0].data() as TrainingPlan;
}

export async function setTrainingPlan(
  plan: Partial<TrainingPlan>,
  userId: string,
  docId?: string
): Promise<void> {
  await deleteExsitingTrainings(userId);
  if (!docId) {
    await trainingsRef.add({
      ...plan,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    } as TrainingPlan);

    return;
  }

  const trainingPlan = {
    ...plan,
    updatedAt: Timestamp.now(),
  };

  await trainingsRef.doc(docId).set(trainingPlan, { merge: true });
}

async function deleteExsitingTrainings(userId: string): Promise<void> {
  const snapshot = await trainingsRef.where("userId", "==", userId).get();

  const batchSize = snapshot.size;
  if (batchSize === 0) {
    return;
  }

  const batch = db.batch();
  snapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();

  // Recurse on the next process tick, to avoid
  // exploding the stack.
  process.nextTick(() => {
    deleteExsitingTrainings(userId);
  });
}

export async function getUserTrainings(user: UserDoc): Promise<string> {
  const training = await getUserTraining(user.id);
  if (!training) {
    return "Você ainda não tem nenhum treino programado\n\n" + trainingMenu();
  }

  // Converte semana em array para seleção
  const daysArray = Object.entries(training.week).map(([key, day]) => ({
    key,
    ...day,
  }));

  let msgText = "Escolha o treino que deseja ver:\n";
  daysArray.forEach((day, idx) => {
    msgText += `${idx + 1}. ${day.name}\n`;
  });
  msgText += "\nDigite o número do treino desejado ou 0 para voltar.";

  return msgText;
}

export async function getWeeklyUserTrainings(user: UserDoc): Promise<string> {
  const training = await getUserTraining(user.id);

  if (!training) {
    return "Você ainda não tem nenhum treino programado!\n\n";
  }

  const weekTraining = training.week;

  if (!weekTraining) {
    return "Não há treino programado para esta semana.\n\n";
  }

  // Monta texto formatado
  let trainingText = `📅 *Treinos da Semana*\n`;

  for (const [_, dayTraining] of Object.entries(weekTraining)) {
    if (dayTraining.exercises.length > 0) {
      trainingText += `\n🏋️ *${dayTraining.name}*\n`;
      dayTraining.exercises.forEach((ex, idx) => {
        let line = `${idx + 1}. ${ex.name}`;

        if (ex.sets && ex.reps) {
          // Exercício de força
          line += ` (${ex.sets}x${ex.reps}`;
          if (ex.restSeconds) line += ` • ${ex.restSeconds}s`;
          line += `)`;
        } else if (ex.tempo_min || ex.tempo_seg) {
          // Exercício de tempo
          const tempoParts = [];
          if (ex.tempo_min) tempoParts.push(`${ex.tempo_min}min`);
          if (ex.tempo_seg) tempoParts.push(`${ex.tempo_seg}s`);
          line += ` (${tempoParts.join(" ")})`;
        }

        if (ex.notes) line += ` – ${ex.notes}`;

        trainingText += `\n${line}`;
      });
    } else {
      trainingText += `\n🏋️ *${dayTraining.name}*: Nenhum exercício.`;
    }
  }

  return trainingText;
}
