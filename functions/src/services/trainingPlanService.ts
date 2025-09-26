import { getFirestore, Timestamp } from "firebase-admin/firestore";
import { TrainingPlan } from "../models/trainingPlan";

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
  userData: Partial<TrainingPlan>,
  docId: string | undefined
): Promise<void> {
  if (!docId) {
    await trainingsRef.add({
      ...userData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    } as TrainingPlan);

    return;
  }

  const trainingPlan = {
    ...userData,
    updatedAt: Timestamp.now(),
  };

  await trainingsRef.doc(docId).set(trainingPlan, { merge: true });
}
