import { shortMonthNames, shortWeekdayNamesFromSunday } from '@/dates/calendarNames';
import { parseLocalDateString } from '@/dates/parseLocalDateString';

export function formatShortDate(localDate: string): string {
  const date = parseLocalDateString(localDate);
  return `${shortWeekdayNamesFromSunday[date.getDay()]} ${date.getDate()} ${shortMonthNames[date.getMonth()]}`;
}
