import { parseLocalDateString } from '@/dates/parseLocalDateString';

const shortWeekdayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const shortMonthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function describeActiveSince(startsOn: string): string {
  const startDate = parseLocalDateString(startsOn);
  return `Active since ${shortWeekdayNames[startDate.getDay()]} ${startDate.getDate()} ${shortMonthNames[startDate.getMonth()]}`;
}
