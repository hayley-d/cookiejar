import { addDays } from '@/dates/addDays';
import { isSameLocalDay } from '@/dates/isSameLocalDay';
import { parseLocalDateString } from '@/dates/parseLocalDateString';

export type HealthDayRange = {
  startDate: Date;
  endDate: Date;
};

export function healthDayRange(date: string, now: Date): HealthDayRange {
  const startDate = parseLocalDateString(date);
  const endDate = isSameLocalDay(startDate, now) ? now : addDays(startDate, 1);
  return { startDate, endDate };
}
