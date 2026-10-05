import { sortByTimeOfDay } from '@/plans/timeOfDay';
import { weekdays } from '@/plans/weekdays';

export type WeekdayEntries<Entry> = {
  dayOfWeek: number;
  name: string;
  entries: Entry[];
};

export function groupEntriesByWeekday<Entry extends { dayOfWeek: number; timeOfDay: string }>(
  entries: readonly Entry[],
): WeekdayEntries<Entry>[] {
  return weekdays.map(({ dayOfWeek, name }) => ({
    dayOfWeek,
    name,
    entries: sortByTimeOfDay(entries.filter((entry) => entry.dayOfWeek === dayOfWeek)),
  }));
}
