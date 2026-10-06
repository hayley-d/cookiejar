import { addDays } from '@/dates/addDays';
import { startOfWeek } from '@/dates/startOfWeek';
import { toLocalDateString } from '@/dates/toLocalDateString';

const daysPerWeek = 7;

export function summaryWeekDates(dateInWeek: Date): string[] {
  const firstDay = startOfWeek(dateInWeek);
  return Array.from({ length: daysPerWeek }, (_, offset) => toLocalDateString(addDays(firstDay, offset)));
}
