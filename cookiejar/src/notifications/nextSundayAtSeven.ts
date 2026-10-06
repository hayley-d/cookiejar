const daysPerWeek = 7;
const summaryHour = 19;

export function nextSundayAtSeven(now: Date): Date {
  const daysUntilSunday = (daysPerWeek - now.getDay()) % daysPerWeek;
  const candidate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + daysUntilSunday, summaryHour, 0, 0, 0);
  if (candidate.getTime() <= now.getTime()) {
    return new Date(
      candidate.getFullYear(),
      candidate.getMonth(),
      candidate.getDate() + daysPerWeek,
      summaryHour,
      0,
      0,
      0,
    );
  }
  return candidate;
}
