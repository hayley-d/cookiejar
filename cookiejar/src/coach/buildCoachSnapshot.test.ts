import { describe, expect, test } from 'bun:test';

import { buildCoachSnapshot, coachSnapshotDateRanges, type CoachSnapshotSources } from '@/coach/buildCoachSnapshot';
import type { CompletedSet } from '@/progress/detectPersonalRecords';
import type { Exercise } from '@/types/Exercise';
import type { FinishedSessionSet } from '@/types/FinishedSessionSet';
import type { HealthSnapshot } from '@/types/HealthSnapshot';
import type { PlanWithEntries } from '@/types/PlanWithEntries';
import type { SessionSummary } from '@/types/SessionSummary';

const wednesdayNineAm = new Date(2026, 9, 7, 9, 0);

const benchPressIdentifier = 7;

function benchSet(weightKilograms: number, repetitions = 8): CompletedSet {
  return {
    exerciseId: benchPressIdentifier,
    trackingType: 'repetitions_and_weight',
    repetitions,
    weightKilograms,
    durationSeconds: null,
    distanceMeters: null,
  };
}

function finishedSet(sessionId: number, startedAt: Date, set: CompletedSet): FinishedSessionSet {
  return {
    sessionId,
    startedAt: startedAt.toISOString(),
    workoutName: `Session ${sessionId}`,
    exerciseName: 'Bench Press',
    exerciseImageUrl: null,
    set,
  };
}

function healthOn(date: string): HealthSnapshot {
  return { date, steps: 1000, sleepMinutes: 420, restingHeartRate: 60, fetchedAt: '' };
}

const benchPress: Exercise = {
  id: benchPressIdentifier,
  name: 'Bench Press',
  bodyPart: 'chest',
  imageUrl: null,
  defaultTrackingType: 'repetitions_and_weight',
  createdAt: '',
};

const workoutSummary = {
  id: 3,
  name: 'Push Day',
  kind: 'individual' as const,
  classType: null,
  durationMinutes: null,
  imageUrl: null,
  exerciseCount: 1,
  targetSetCount: 3,
  targetRestSeconds: 90,
};

const mondayPlan: PlanWithEntries = {
  id: 2,
  name: 'Summer Strength',
  isActive: true,
  startsOn: '2026-09-01',
  createdAt: '',
  entries: [{ id: 11, planId: 2, workoutId: 3, dayOfWeek: 1, timeOfDay: '17:30', workout: workoutSummary }],
};

function sources(overrides: Partial<CoachSnapshotSources> = {}): CoachSnapshotSources {
  return {
    now: wednesdayNineAm,
    profile: null,
    activePlan: null,
    finishedSessionCount: 0,
    finishedSessionSets: [],
    scheduledSessions: [],
    healthSnapshots: [],
    latestBodyMeasurement: null,
    exercises: [],
    ...overrides,
  };
}

describe('coachSnapshotDateRanges', () => {
  test('uses the Monday week start, twelve weeks of sessions, four weeks of schedule and fourteen recent days', () => {
    expect(coachSnapshotDateRanges(wednesdayNineAm)).toEqual({
      today: '2026-10-07',
      weekStartDate: '2026-10-05',
      weekEndDate: '2026-10-11',
      scheduleStartDate: '2026-09-07',
      sessionsStartDate: '2026-07-20',
      recentStartDate: '2026-09-24',
    });
  });
});

describe('buildCoachSnapshot', () => {
  test('carries now, the week start and the plain sources through', () => {
    const snapshot = buildCoachSnapshot(sources({ finishedSessionCount: 5, activePlan: mondayPlan }));
    expect(snapshot.now).toBe(wednesdayNineAm);
    expect(snapshot.today).toBe('2026-10-07');
    expect(snapshot.weekStartDate).toBe('2026-10-05');
    expect(snapshot.finishedSessionCount).toBe(5);
    expect(snapshot.activePlan).toBe(mondayPlan);
  });

  test('groups sets into sessions in order', () => {
    const startedAt = new Date(2026, 9, 6, 18, 0);
    const snapshot = buildCoachSnapshot(
      sources({
        finishedSessionSets: [
          finishedSet(1, startedAt, benchSet(60)),
          finishedSet(1, startedAt, benchSet(62.5)),
          finishedSet(2, new Date(2026, 9, 7, 7, 0), benchSet(65)),
        ],
      }),
    );
    expect(snapshot.sessionsLastTwelveWeeks).toEqual([
      {
        sessionId: 1,
        startedAt: startedAt.toISOString(),
        workoutName: 'Session 1',
        sets: [benchSet(60), benchSet(62.5)],
      },
      {
        sessionId: 2,
        startedAt: new Date(2026, 9, 7, 7, 0).toISOString(),
        workoutName: 'Session 2',
        sets: [benchSet(65)],
      },
    ]);
  });

  test('keeps sessions from the start of the twelve-week window and drops older ones', () => {
    const snapshot = buildCoachSnapshot(
      sources({
        finishedSessionSets: [
          finishedSet(1, new Date(2026, 6, 19, 23, 59), benchSet(60)),
          finishedSet(2, new Date(2026, 6, 20, 0, 0), benchSet(60)),
        ],
      }),
    );
    expect(snapshot.sessionsLastTwelveWeeks.map((session) => session.sessionId)).toEqual([2]);
  });

  test('lists personal records from the whole history but keeps only the last fourteen days', () => {
    const snapshot = buildCoachSnapshot(
      sources({
        finishedSessionSets: [
          finishedSet(1, new Date(2026, 5, 1, 18, 0), benchSet(50)),
          finishedSet(2, new Date(2026, 8, 23, 23, 59), benchSet(60)),
          finishedSet(3, new Date(2026, 8, 24, 0, 0), benchSet(62.5)),
          finishedSet(4, new Date(2026, 9, 6, 18, 0), benchSet(65)),
        ],
      }),
    );
    expect(snapshot.personalRecordsLastFourteenDays.map((recordEvent) => recordEvent.sessionId)).toEqual([4, 3]);
    expect(snapshot.personalRecordsLastFourteenDays[0].record.exerciseId).toBe(benchPressIdentifier);
  });

  test("splits this week's scheduled workouts from the previous four weeks", () => {
    const completedSession: SessionSummary = {
      id: 30,
      planEntryId: 11,
      scheduledDate: '2026-10-05',
      startedAt: new Date(2026, 9, 5, 17, 30).toISOString(),
      finishedAt: new Date(2026, 9, 5, 18, 30).toISOString(),
      workout: workoutSummary,
    };
    const snapshot = buildCoachSnapshot(sources({ activePlan: mondayPlan, scheduledSessions: [completedSession] }));
    expect(snapshot.scheduledThisWeek).toHaveLength(1);
    expect(snapshot.scheduledThisWeek[0]).toMatchObject({ date: '2026-10-05', status: 'completed', sessionId: 30 });
    expect(snapshot.scheduledPreviousFourWeeks.map((scheduledWorkout) => scheduledWorkout.date)).toEqual([
      '2026-09-07',
      '2026-09-14',
      '2026-09-21',
      '2026-09-28',
    ]);
  });

  test('keeps fourteen days of health snapshots, oldest first', () => {
    const snapshot = buildCoachSnapshot(
      sources({
        healthSnapshots: [
          healthOn('2026-10-08'),
          healthOn('2026-10-07'),
          healthOn('2026-09-24'),
          healthOn('2026-09-23'),
        ],
      }),
    );
    expect(snapshot.healthLastFourteenDays.map((healthSnapshot) => healthSnapshot.date)).toEqual([
      '2026-09-24',
      '2026-10-07',
    ]);
  });

  test('maps exercises by id', () => {
    const snapshot = buildCoachSnapshot(sources({ exercises: [benchPress] }));
    expect(snapshot.exercisesById.get(benchPressIdentifier)).toBe(benchPress);
    expect(snapshot.exercisesById.size).toBe(1);
  });
});
