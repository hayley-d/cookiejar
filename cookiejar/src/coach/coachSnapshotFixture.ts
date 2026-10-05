import type { CoachSnapshot } from '@/coach/CoachSnapshot';
import type { ScheduledWorkout, ScheduledWorkoutStatus } from '@/types/ScheduledWorkout';

export const fixtureNow = new Date(2026, 9, 7, 9, 0);

export function createCoachSnapshot(overrides: Partial<CoachSnapshot> = {}): CoachSnapshot {
  return {
    now: fixtureNow,
    today: '2026-10-07',
    weekStartDate: '2026-10-05',
    profile: null,
    activePlan: null,
    finishedSessionCount: 10,
    sessionsLastTwelveWeeks: [],
    personalRecordsLastFourteenDays: [],
    scheduledThisWeek: [],
    scheduledPreviousFourWeeks: [],
    healthLastFourteenDays: [],
    latestBodyMeasurement: null,
    exercisesById: new Map(),
    ...overrides,
  };
}

type ScheduledWorkoutFixture = {
  date: string;
  name?: string;
  timeOfDay?: string | null;
  status?: ScheduledWorkoutStatus;
  isPlanned?: boolean;
};

export function createScheduledWorkout({
  date,
  name = 'Push Day',
  timeOfDay = '17:30',
  status = 'planned',
  isPlanned = true,
}: ScheduledWorkoutFixture): ScheduledWorkout {
  return {
    date,
    timeOfDay: isPlanned ? timeOfDay : null,
    planEntryId: isPlanned ? 1 : null,
    status,
    sessionId: status === 'planned' ? null : 1,
    workout: {
      id: 1,
      name,
      kind: 'individual',
      classType: null,
      durationMinutes: null,
      imageUrl: null,
      exerciseCount: 3,
      targetSetCount: 9,
      targetRestSeconds: 90,
    },
  };
}
