export function addDays(date: Date, count: number): Date {
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() + count,
    date.getHours(),
    date.getMinutes(),
    date.getSeconds(),
    date.getMilliseconds(),
  );
}
