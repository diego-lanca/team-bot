export function parseAge(msg: string): number | null {
  const age = parseInt(msg.trim(), 10);
  return isNaN(age) ? null : age;
}
