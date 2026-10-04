export function dayOfWeekNumber(date: Date): number {
  return ((date.getDay() + 6) % 7) + 1;
}
