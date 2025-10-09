import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { TrainingPlan } from "../models/trainingPlan";
import { UserDoc } from "../models/user";

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
  docId?: string
): Promise<void> {
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

export async function getUserTrainings(user: UserDoc): Promise<string> {
  const training = await getUserTraining(user.id);
  if (!training) return "";

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
