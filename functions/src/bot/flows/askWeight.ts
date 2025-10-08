import { UserDoc } from "../../models/user";

export const askWeight = (user: UserDoc): string => {
  return `Certo, ${user.name}! ` +
  '\nAgora me conta, qual o seu peso (ex: 80kg)? 🏋️‍♂️';
};