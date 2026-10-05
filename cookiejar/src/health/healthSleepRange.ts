import { parseLocalDateString } from '@/dates/parseLocalDateString';

export type HealthSleepRange = {
  startDate: Date;
  endDate: Date;
};

export function healthSleepRange(date: string): HealthSleepRange {
  const day = parseLocalDateString(date);
  return {
    startDate: new Date(day.getFullYear(), day.getMonth(), day.getDate() - 1, 18, 0, 0, 0),
    endDate: new Date(day.getFullYear(), day.getMonth(), day.getDate(), 12, 0, 0, 0),
  };
}
