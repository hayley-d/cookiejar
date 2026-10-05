import type { CoachSnapshot, FinishedSessionWithSets } from '@/coach/CoachSnapshot';
import { addDays } from '@/dates/addDays';
import { parseLocalDateString } from '@/dates/parseLocalDateString';
import { startOfWeek } from '@/dates/startOfWeek';
import { toLocalDateString } from '@/dates/toLocalDateString';
import { buildScheduledWorkouts } from '@/plans/buildScheduledWorkouts';
import type { CompletedSet } from '@/progress/detectPersonalRecords';
import { listPersonalRecordsFromHistory } from '@/progress/listPersonalRecordsFromHistory';
import type { BodyMeasurement } from '@/types/BodyMeasurement';
import type { Exercise } from '@/types/Exercise';
import type { FinishedSessionSet } from '@/types/FinishedSessionSet';
import type { HealthSnapshot } from '@/types/HealthSnapshot';
import type { PlanWithEntries } from '@/types/PlanWithEntries';
import type { Profile } from '@/types/Profile';
import type { SessionSummary } from '@/types/SessionSummary';

export const sessionWindowWeekCount = 12;
export const scheduleHistoryWeekCount = 4;
export const recentDayCount = 14;

const daysPerWeek = 7;

export type CoachSnapshotDateRanges = {
  today: string;
  weekStartDate: string;
  weekEndDate: string;
  scheduleStartDate: string;
  sessionsStartDate: string;
  recentStartDate: string;
};

export type CoachSnapshotSources = {
  now: Date;
  profile: Profile | null;
  activePlan: PlanWithEntries | null;
  finishedSessionCount: number;
  finishedSessionSets: readonly FinishedSessionSet[];
  scheduledSessions: readonly SessionSummary[];
  healthSnapshots: readonly HealthSnapshot[];
  latestBodyMeasurement: BodyMeasurement | null;
  exercises: readonly Exercise[];
};

export function coachSnapshotDateRanges(now: Date): CoachSnapshotDateRanges {
  const weekStart = startOfWeek(now);
  return {
    today: toLocalDateString(now),
    weekStartDate: toLocalDateString(weekStart),
    weekEndDate: toLocalDateString(addDays(weekStart, daysPerWeek - 1)),
    scheduleStartDate: toLocalDateString(addDays(weekStart, -scheduleHistoryWeekCount * daysPerWeek)),
    sessionsStartDate: toLocalDateString(addDays(weekStart, -(sessionWindowWeekCount - 1) * daysPerWeek)),
    recentStartDate: toLocalDateString(addDays(now, -(recentDayCount - 1))),
  };
}

export function groupSetsIntoSessions(finishedSessionSets: readonly FinishedSessionSet[]): FinishedSessionWithSets[] {
  const sessionsById = new Map<number, FinishedSessionWithSets & { sets: CompletedSet[] }>();
  for (const finishedSessionSet of finishedSessionSets) {
    const existingSession = sessionsById.get(finishedSessionSet.sessionId);
    if (existingSession) {
      existingSession.sets.push(finishedSessionSet.set);
    } else {
      sessionsById.set(finishedSessionSet.sessionId, {
        sessionId: finishedSessionSet.sessionId,
        startedAt: finishedSessionSet.startedAt,
        workoutName: finishedSessionSet.workoutName,
        sets: [finishedSessionSet.set],
      });
    }
  }
  return [...sessionsById.values()];
}

function startsOnOrAfter(startedAt: string, localDate: string): boolean {
  return new Date(startedAt).getTime() >= parseLocalDateString(localDate).getTime();
}

export function buildCoachSnapshot(sources: CoachSnapshotSources): CoachSnapshot {
  const dateRanges = coachSnapshotDateRanges(sources.now);
  const allSessions = groupSetsIntoSessions(sources.finishedSessionSets);
  const scheduledWorkoutsByDate = buildScheduledWorkouts({
    startDate: dateRanges.scheduleStartDate,
    endDate: dateRanges.weekEndDate,
    activePlan: sources.activePlan,
    sessions: sources.scheduledSessions,
  });
  const scheduledWorkouts = [...scheduledWorkoutsByDate.values()].flat();

  return {
    now: sources.now,
    today: dateRanges.today,
    weekStartDate: dateRanges.weekStartDate,
    profile: sources.profile,
    activePlan: sources.activePlan,
    finishedSessionCount: sources.finishedSessionCount,
    sessionsLastTwelveWeeks: allSessions.filter((session) =>
      startsOnOrAfter(session.startedAt, dateRanges.sessionsStartDate),
    ),
    personalRecordsLastFourteenDays: listPersonalRecordsFromHistory(allSessions).filter((recordEvent) =>
      startsOnOrAfter(recordEvent.startedAt, dateRanges.recentStartDate),
    ),
    scheduledThisWeek: scheduledWorkouts.filter(
      (scheduledWorkout) => scheduledWorkout.date >= dateRanges.weekStartDate,
    ),
    scheduledPreviousFourWeeks: scheduledWorkouts.filter(
      (scheduledWorkout) => scheduledWorkout.date < dateRanges.weekStartDate,
    ),
    healthLastFourteenDays: sources.healthSnapshots
      .filter(
        (healthSnapshot) =>
          healthSnapshot.date >= dateRanges.recentStartDate && healthSnapshot.date <= dateRanges.today,
      )
      .sort((first, second) => (first.date < second.date ? -1 : first.date > second.date ? 1 : 0)),
    latestBodyMeasurement: sources.latestBodyMeasurement,
    exercisesById: new Map(sources.exercises.map((exercise) => [exercise.id, exercise])),
  };
}
