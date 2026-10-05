const millisecondsPerDay = 24 * 60 * 60 * 1000;

export function dayOfYear(date: Date): number {
  const startOfYearUtc = Date.UTC(date.getFullYear(), 0, 1);
  const dateUtc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.round((dateUtc - startOfYearUtc) / millisecondsPerDay) + 1;
}
