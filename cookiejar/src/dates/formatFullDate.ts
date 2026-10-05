import { monthNames, weekdayNamesFromSunday } from '@/dates/calendarNames';
import { parseLocalDateString } from '@/dates/parseLocalDateString';

export function formatFullDate(localDate: string): string {
  const date = parseLocalDateString(localDate);
  return `${weekdayNamesFromSunday[date.getDay()]} ${date.getDate()} ${monthNames[date.getMonth()]}`;
}
