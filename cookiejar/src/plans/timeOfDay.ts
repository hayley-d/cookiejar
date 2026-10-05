const timeOfDayPattern = /^([01]\d|2[0-3]):([0-5]\d)$/;
const minutesPerHour = 60;

const firstEntryTimeOfDay = '07:00';
const latestDefaultTimeOfDay = '23:30';
const defaultGapInMinutes = 60;

export function isTimeOfDay(text: string): boolean {
  return timeOfDayPattern.test(text);
}

export function timeOfDayToMinutes(timeOfDay: string): number {
  const match = timeOfDayPattern.exec(timeOfDay);
  if (!match) {
    throw new Error(`Invalid time of day: ${timeOfDay}`);
  }
  return Number(match[1]) * minutesPerHour + Number(match[2]);
}

export function minutesToTimeOfDay(minutesSinceMidnight: number): string {
  const hours = Math.floor(minutesSinceMidnight / minutesPerHour);
  const minutes = minutesSinceMidnight % minutesPerHour;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

export function timeOfDayToDate(timeOfDay: string, day: Date): Date {
  const minutesSinceMidnight = timeOfDayToMinutes(timeOfDay);
  return new Date(
    day.getFullYear(),
    day.getMonth(),
    day.getDate(),
    Math.floor(minutesSinceMidnight / minutesPerHour),
    minutesSinceMidnight % minutesPerHour,
  );
}

export function dateToTimeOfDay(date: Date): string {
  return minutesToTimeOfDay(date.getHours() * minutesPerHour + date.getMinutes());
}

export function formatTimeOfDay(timeOfDay: string): string {
  return minutesToTimeOfDay(timeOfDayToMinutes(timeOfDay));
}

export function compareTimeOfDay(first: string, second: string): number {
  return timeOfDayToMinutes(first) - timeOfDayToMinutes(second);
}

export function sortByTimeOfDay<Item extends { timeOfDay: string }>(items: readonly Item[]): Item[] {
  return [...items].sort((first, second) => compareTimeOfDay(first.timeOfDay, second.timeOfDay));
}

export function defaultTimeOfDayForNewEntry(existingTimesOfDay: readonly string[]): string {
  if (existingTimesOfDay.length === 0) {
    return firstEntryTimeOfDay;
  }
  const latestMinutes = Math.max(...existingTimesOfDay.map(timeOfDayToMinutes));
  const cappedMinutes = Math.min(latestMinutes + defaultGapInMinutes, timeOfDayToMinutes(latestDefaultTimeOfDay));
  return minutesToTimeOfDay(cappedMinutes);
}
