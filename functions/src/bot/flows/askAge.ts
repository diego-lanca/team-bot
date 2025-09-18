import { Timestamp } from "firebase-admin/firestore";
import { UserDoc } from "../../models/user";
import { setSession } from "../../services/firestoreService";
import { setUser } from "../../services/userService";

export const askAge = async (user: UserDoc, msg: string): Promise<string> => {
  await setSession(user.id, {
    step: "ask_age",
    updatedAt: Timestamp.now(),
  });

  await setUser(user.id, {
    age: parseInt(msg),
    lastSeen: Timestamp.now(),
  });

  return `Ótimo, ${user.name}! ` +
  '\nAgora me conta, qual a sua idade? 🏋️‍♂️';
};
