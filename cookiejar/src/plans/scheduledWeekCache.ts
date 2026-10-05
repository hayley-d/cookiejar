import { addDays } from '@/dates/addDays';
import { parseLocalDateString } from '@/dates/parseLocalDateString';
import { startOfWeek } from '@/dates/startOfWeek';
import { toLocalDateString } from '@/dates/toLocalDateString';
import type { ScheduledWorkout } from '@/types/ScheduledWorkout';

export type ScheduledWeek =
  | { outcome: 'ready'; scheduledWorkoutsByDate: Map<string, ScheduledWorkout[]> }
  | { outcome: 'failed' };

export type ScheduledWeekCache = ReadonlyMap<string, ScheduledWeek>;

export type ScheduledWorkoutsForDateLookup =
  | { status: 'loading' }
  | { status: 'failed' }
  | { status: 'ready'; scheduledWorkouts: ScheduledWorkout[] };

const daysPerWeek = 7;

export const emptyScheduledWeekCache: ScheduledWeekCache = new Map();

function shiftWeekStart(weekStart: string, weekCount: number): string {
  return toLocalDateString(addDays(parseLocalDateString(weekStart), weekCount * daysPerWeek));
}

export function weekStartsAroundVisible(visibleWeekStart: string): string[] {
  return [shiftWeekStart(visibleWeekStart, -1), visibleWeekStart, shiftWeekStart(visibleWeekStart, 1)];
}

export function missingWeekStarts(cache: ScheduledWeekCache, visibleWeekStart: string): string[] {
  return weekStartsAroundVisible(visibleWeekStart).filter((weekStart) => !cache.has(weekStart));
}

export function mergeLoadedWeeks(
  cache: ScheduledWeekCache,
  loadedWeeks: ReadonlyMap<string, ScheduledWeek>,
): ScheduledWeekCache {
  return new Map([...cache, ...loadedWeeks]);
}

export function scheduledWorkoutsForDate(cache: ScheduledWeekCache, date: string): ScheduledWorkoutsForDateLookup {
  const week = cache.get(toLocalDateString(startOfWeek(parseLocalDateString(date))));
  if (week === undefined) {
    return { status: 'loading' };
  }
  if (week.outcome === 'failed') {
    return { status: 'failed' };
  }
  return { status: 'ready', scheduledWorkouts: week.scheduledWorkoutsByDate.get(date) ?? [] };
}
