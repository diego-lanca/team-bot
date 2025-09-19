import { UserDoc } from "../../models/user";

export const askAge = (user: UserDoc): string => {
  return `Ótimo, ${user.name}! ` +
  '\nAgora me conta, qual a sua idade? 🏋️‍♂️';
};
