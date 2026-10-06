import { addDays } from "@/dates/addDays";
import { formatDayMonth } from "@/dates/formatDayMonth";
import { isSameLocalDay } from "@/dates/isSameLocalDay";
import { toLocalDateString } from "@/dates/toLocalDateString";

const millisecondsPerMinute = 60 * 1000;
const millisecondsPerHour = 60 * millisecondsPerMinute;

export function formatRelativeTime(isoTimestamp: string, now: Date): string {
  const timestamp = new Date(isoTimestamp);
  const elapsedMilliseconds = now.getTime() - timestamp.getTime();

  if (elapsedMilliseconds < millisecondsPerMinute) {
    return "Just now";
  }
  if (isSameLocalDay(timestamp, now)) {
    if (elapsedMilliseconds < millisecondsPerHour) {
      return `${Math.floor(elapsedMilliseconds / millisecondsPerMinute)}m ago`;
    }
    return `${Math.floor(elapsedMilliseconds / millisecondsPerHour)}h ago`;
  }
  if (isSameLocalDay(timestamp, addDays(now, -1))) {
    return "Yesterday";
  }
  return formatDayMonth(toLocalDateString(timestamp));
}
