import { shortMonthNames } from '@/dates/calendarNames';
import { parseLocalDateString } from '@/dates/parseLocalDateString';

export function formatDayMonth(localDate: string): string {
  const date = parseLocalDateString(localDate);
  return `${date.getDate()} ${shortMonthNames[date.getMonth()]}`;
}
