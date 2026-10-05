import { addDays } from '@/dates/addDays';
import { dayOfWeekNumber } from '@/dates/dayOfWeekNumber';
import { parseLocalDateString } from '@/dates/parseLocalDateString';
import { toLocalDateString } from '@/dates/toLocalDateString';
import { sortByTimeOfDay } from '@/plans/timeOfDay';
import type { ScheduledWorkout } from '@/types/ScheduledWorkout';
import type { PlanWithEntries } from '@/types/PlanWithEntries';
import type { SessionSummary } from '@/types/SessionSummary';

export type BuildScheduledWorkoutsInput = {
  startDate: string;
  endDate: string;
  activePlan: PlanWithEntries | null;
  sessions: readonly SessionSummary[];
};

function compareSessionsByStart(
  first: SessionSummary,
  second: SessionSummary,
): number {
  if (first.startedAt !== second.startedAt) {
    return first.startedAt < second.startedAt ? -1 : 1;
  }
  return first.id - second.id;
}

function buildDay(
  date: string,
  activePlan: PlanWithEntries | null,
  sessionsOnDate: readonly SessionSummary[],
): ScheduledWorkout[] {
  const isPlanInEffect =
    activePlan !== null &&
    activePlan.startsOn !== null &&
    date >= activePlan.startsOn;
  const dayOfWeek = dayOfWeekNumber(parseLocalDateString(date));
  const plannedEntries = isPlanInEffect
    ? sortByTimeOfDay(
        activePlan.entries.filter((entry) => entry.dayOfWeek === dayOfWeek),
      )
    : [];

  const orderedSessions = [...sessionsOnDate].sort(compareSessionsByStart);
  const claimedSessionIds = new Set<number>();

  const plannedWorkouts = plannedEntries.map((entry): ScheduledWorkout => {
    const matchingSession = orderedSessions.find(
      (session) =>
        session.planEntryId === entry.id && !claimedSessionIds.has(session.id),
    );
    if (matchingSession === undefined) {
      return {
        date,
        timeOfDay: entry.timeOfDay,
        planEntryId: entry.id,
        workout: entry.workout,
        status: 'planned',
        sessionId: null,
      };
    }
    claimedSessionIds.add(matchingSession.id);
    return {
      date,
      timeOfDay: entry.timeOfDay,
      planEntryId: entry.id,
      workout: entry.workout,
      status: matchingSession.finishedAt === null ? 'inProgress' : 'completed',
      sessionId: matchingSession.id,
    };
  });

  const unplannedWorkouts = orderedSessions
    .filter((session) => !claimedSessionIds.has(session.id))
    .map((session): ScheduledWorkout => ({
      date,
      timeOfDay: null,
      planEntryId: null,
      workout: session.workout,
      status: session.finishedAt === null ? 'inProgress' : 'completed',
      sessionId: session.id,
    }));

  return [...plannedWorkouts, ...unplannedWorkouts];
}

export function buildScheduledWorkouts({
  startDate,
  endDate,
  activePlan,
  sessions,
}: BuildScheduledWorkoutsInput): Map<string, ScheduledWorkout[]> {
  const sessionsByDate = new Map<string, SessionSummary[]>();
  for (const session of sessions) {
    const sessionsOnDate = sessionsByDate.get(session.scheduledDate) ?? [];
    sessionsOnDate.push(session);
    sessionsByDate.set(session.scheduledDate, sessionsOnDate);
  }

  const scheduledWorkoutsByDate = new Map<string, ScheduledWorkout[]>();
  const lastDay = parseLocalDateString(endDate);
  for (
    let day = parseLocalDateString(startDate);
    day <= lastDay;
    day = addDays(day, 1)
  ) {
    const date = toLocalDateString(day);
    scheduledWorkoutsByDate.set(
      date,
      buildDay(date, activePlan, sessionsByDate.get(date) ?? []),
    );
  }
  return scheduledWorkoutsByDate;
}
