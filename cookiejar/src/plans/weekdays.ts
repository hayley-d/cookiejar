export type Weekday = {
  dayOfWeek: number;
  name: string;
};

export const weekdays: readonly Weekday[] = [
  { dayOfWeek: 1, name: 'Monday' },
  { dayOfWeek: 2, name: 'Tuesday' },
  { dayOfWeek: 3, name: 'Wednesday' },
  { dayOfWeek: 4, name: 'Thursday' },
  { dayOfWeek: 5, name: 'Friday' },
  { dayOfWeek: 6, name: 'Saturday' },
  { dayOfWeek: 7, name: 'Sunday' },
];

export function weekdayName(dayOfWeek: number): string {
  const weekday = weekdays.find((candidate) => candidate.dayOfWeek === dayOfWeek);
  if (!weekday) {
    throw new Error(`Invalid day of week: ${dayOfWeek}`);
  }
  return weekday.name;
}
