import { dayOfWeekNumber } from '@/dates/dayOfWeekNumber';

export function startOfWeek(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() - (dayOfWeekNumber(date) - 1));
}
