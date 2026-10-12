import { parseLocalDateString } from '@/dates/parseLocalDateString';

const millisecondsPerSecond = 1000;

export type ActivityTimes = {
  startedAt: string;
  finishedAt: string;
};

export function buildActivityTimes(date: string, startTime: Date, durationSeconds: number): ActivityTimes {
  const day = parseLocalDateString(date);
  const startedAtDate = new Date(
    day.getFullYear(),
    day.getMonth(),
    day.getDate(),
    startTime.getHours(),
    startTime.getMinutes(),
  );
  const finishedAtDate = new Date(startedAtDate.getTime() + durationSeconds * millisecondsPerSecond);
  return { startedAt: startedAtDate.toISOString(), finishedAt: finishedAtDate.toISOString() };
}
