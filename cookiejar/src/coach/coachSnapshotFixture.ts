import type { CoachSnapshot, FinishedSessionWithSets } from '@/coach/CoachSnapshot';
import type { CompletedSet } from '@/progress/detectPersonalRecords';
import type { PersonalRecordEvent } from '@/progress/listPersonalRecordsFromHistory';
import type { Exercise } from '@/types/Exercise';
import type { HealthSnapshot } from '@/types/HealthSnapshot';
import type { PlanWithEntries } from '@/types/PlanWithEntries';
import type { Profile } from '@/types/Profile';
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

export const seededSquat: Exercise = {
  id: 2,
  name: 'Squat',
  bodyPart: 'quadriceps',
  imageUrl: null,
  defaultTrackingType: 'repetitions_and_weight',
  createdAt: '',
};

export const seededBenchPress: Exercise = {
  id: 1,
  name: 'Bench Press',
  bodyPart: 'chest',
  imageUrl: null,
  defaultTrackingType: 'repetitions_and_weight',
  createdAt: '',
};

export const seededDeadlift: Exercise = {
  id: 3,
  name: 'Deadlift',
  bodyPart: 'back',
  imageUrl: null,
  defaultTrackingType: 'repetitions_and_weight',
  createdAt: '',
};

export const seededPlan: PlanWithEntries = {
  id: 7,
  name: 'Summer Strength',
  isActive: true,
  startsOn: '2026-08-26',
  createdAt: '',
  entries: [],
};

export function createWeightedSet(exerciseId: number, weightKilograms: number, repetitions: number): CompletedSet {
  return {
    exerciseId,
    trackingType: 'repetitions_and_weight',
    repetitions,
    weightKilograms,
    durationSeconds: null,
    distanceMeters: null,
  };
}

export function createFinishedSession(
  monthIndex: number,
  dayOfMonth: number,
  sets: readonly CompletedSet[],
): FinishedSessionWithSets {
  const startedAt = new Date(2026, monthIndex, dayOfMonth, 18, 0);
  return {
    sessionId: startedAt.getTime(),
    startedAt: startedAt.toISOString(),
    workoutName: 'Session',
    sets,
  };
}

export function createHealthSnapshot(
  date: string,
  readings: { sleepMinutes?: number | null; restingHeartRate?: number | null },
): HealthSnapshot {
  return {
    date,
    steps: 0,
    sleepMinutes: readings.sleepMinutes ?? null,
    restingHeartRate: readings.restingHeartRate ?? null,
    fetchedAt: '2026-10-07T09:00:00.000Z',
  };
}

export function createSquatRecordEvent(): PersonalRecordEvent {
  return {
    sessionId: 1,
    startedAt: new Date(2026, 9, 5, 18, 0).toISOString(),
    record: {
      exerciseId: seededSquat.id,
      recordType: 'heaviestWeight',
      set: createWeightedSet(seededSquat.id, 100, 5),
    },
  };
}

const squatPlateauSessions: readonly FinishedSessionWithSets[] = [
  createFinishedSession(8, 14, [createWeightedSet(seededSquat.id, 80, 5)]),
  createFinishedSession(8, 21, [createWeightedSet(seededSquat.id, 80, 5)]),
  createFinishedSession(8, 28, [createWeightedSet(seededSquat.id, 80, 5)]),
  createFinishedSession(9, 5, [createWeightedSet(seededSquat.id, 80, 5)]),
];

export function createSeededCoachSnapshot(overrides: Partial<CoachSnapshot> = {}): CoachSnapshot {
  return createCoachSnapshot({
    activePlan: seededPlan,
    finishedSessionCount: 10,
    sessionsLastTwelveWeeks: squatPlateauSessions,
    personalRecordsLastFourteenDays: [createSquatRecordEvent()],
    healthLastFourteenDays: [createHealthSnapshot('2026-10-07', { sleepMinutes: 340 })],
    exercisesById: new Map([[seededSquat.id, seededSquat]]),
    ...overrides,
  });
}

const fullyLoadedProfile: Profile = {
  id: 1,
  displayName: 'Hayley',
  birthDate: null,
  sex: null,
  heightCentimetres: null,
  goal: 'hypertrophy',
  weeklyWorkoutTarget: 1,
  dailyStepGoal: 8000,
  updatedAt: '',
};

export function createFullyLoadedCoachSnapshot(): CoachSnapshot {
  const previousDates = [
    '2026-10-06',
    '2026-10-05',
    '2026-10-04',
    '2026-10-03',
    '2026-10-02',
    '2026-10-01',
    '2026-09-30',
  ];
  return createCoachSnapshot({
    profile: fullyLoadedProfile,
    activePlan: seededPlan,
    finishedSessionCount: 12,
    sessionsLastTwelveWeeks: [
      createFinishedSession(8, 14, [
        createWeightedSet(seededSquat.id, 80, 5),
        createWeightedSet(seededDeadlift.id, 100, 5),
      ]),
      createFinishedSession(8, 21, [
        createWeightedSet(seededSquat.id, 80, 5),
        createWeightedSet(seededDeadlift.id, 105, 5),
      ]),
      createFinishedSession(8, 28, [
        createWeightedSet(seededSquat.id, 80, 5),
        createWeightedSet(seededDeadlift.id, 110, 5),
      ]),
      createFinishedSession(9, 5, [
        createWeightedSet(seededSquat.id, 80, 5),
        createWeightedSet(seededDeadlift.id, 115, 5),
      ]),
      createFinishedSession(
        9,
        6,
        Array.from({ length: 10 }, () => createWeightedSet(seededBenchPress.id, 100, 10)),
      ),
    ],
    personalRecordsLastFourteenDays: [createSquatRecordEvent()],
    scheduledThisWeek: [
      createScheduledWorkout({ date: '2026-10-05' }),
      createScheduledWorkout({ date: '2026-10-06' }),
      createScheduledWorkout({ date: '2026-10-07', status: 'completed' }),
    ],
    healthLastFourteenDays: [
      createHealthSnapshot('2026-10-07', {
        sleepMinutes: 340,
        restingHeartRate: 70,
      }),
      ...previousDates.map((date) => createHealthSnapshot(date, { restingHeartRate: 60 })),
    ],
    exercisesById: new Map([seededSquat, seededBenchPress, seededDeadlift].map((exercise) => [exercise.id, exercise])),
  });
}
