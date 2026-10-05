import { addDays } from '@/dates/addDays';
import { parseLocalDateString } from '@/dates/parseLocalDateString';
import { toLocalDateString } from '@/dates/toLocalDateString';

export function datesBetween(startDate: string, endDate: string): string[] {
  const dates: string[] = [];
  const lastDate = parseLocalDateString(endDate);
  let currentDate = parseLocalDateString(startDate);
  while (currentDate.getTime() <= lastDate.getTime()) {
    dates.push(toLocalDateString(currentDate));
    currentDate = addDays(currentDate, 1);
  }
  return dates;
}
