import { UserDoc } from "../../models/user";

export const askWeight = (user: UserDoc): string => {
  return `Ok, ${user.name}! ` +
  '\nAgora me conta, qual o seu tamanho (ex: 1.75)? 🏋️‍♂️';
};