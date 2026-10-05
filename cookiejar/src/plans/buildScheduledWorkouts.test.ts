import { describe, expect, test } from 'bun:test';

import { buildScheduledWorkouts } from '@/plans/buildScheduledWorkouts';
import type {
  PlanEntryWithWorkout,
  PlanWithEntries,
} from '@/types/PlanWithEntries';
import type { SessionSummary } from '@/types/SessionSummary';

function makeWorkout(id: number, name: string) {
  return {
    id,
    name,
    kind: 'individual' as const,
    classType: null,
    durationMinutes: null,
    imageUrl: null,
    exerciseCount: 3,
    targetSetCount: 9,
    targetRestSeconds: 540,
  };
}

function makeEntry(
  id: number,
  dayOfWeek: number,
  timeOfDay: string,
  workoutId: number,
  name: string,
): PlanEntryWithWorkout {
  return {
    id,
    planId: 1,
    workoutId,
    dayOfWeek,
    timeOfDay,
    workout: makeWorkout(workoutId, name),
  };
}

function makePlan(
  startsOn: string | null,
  entries: PlanEntryWithWorkout[],
): PlanWithEntries {
  return {
    id: 1,
    name: 'Plan',
    isActive: true,
    startsOn,
    createdAt: '2026-09-01T00:00:00.000Z',
    entries,
  };
}

function makeSession(
  id: number,
  scheduledDate: string,
  planEntryId: number | null,
  finishedAt: string | null,
  workoutId: number | null = 1,
  name = 'Legs',
): SessionSummary {
  return {
    id,
    planEntryId,
    scheduledDate,
    startedAt: `${scheduledDate}T08:00:00.000Z`,
    finishedAt,
    workout: { ...makeWorkout(0, name), id: workoutId },
  };
}

const mondayEntryLate = makeEntry(1, 1, '17:30', 2, 'Weights');
const mondayEntryEarly = makeEntry(2, 1, '06:00', 1, 'Spin');
const wednesdayEntry = makeEntry(3, 3, '07:00', 3, 'Yoga');

describe('buildScheduledWorkouts', () => {
  test('returns an empty list for every date when there is no active plan', () => {
    const result = buildScheduledWorkouts({
      startDate: '2026-10-05',
      endDate: '2026-10-07',
      activePlan: null,
      sessions: [],
    });

    expect([...result.keys()]).toEqual([
      '2026-10-05',
      '2026-10-06',
      '2026-10-07',
    ]);
    expect([...result.values()]).toEqual([[], [], []]);
  });

  test('returns nothing before the plan start date and entries from it onward', () => {
    const result = buildScheduledWorkouts({
      startDate: '2026-09-28',
      endDate: '2026-10-05',
      activePlan: makePlan('2026-10-05', [mondayEntryEarly]),
      sessions: [],
    });

    expect(result.get('2026-09-28')).toEqual([]);
    expect(
      result.get('2026-10-05')?.map((scheduled) => scheduled.planEntryId),
    ).toEqual([2]);
  });

  test('orders two entries on one day by time of day', () => {
    const result = buildScheduledWorkouts({
      startDate: '2026-10-05',
      endDate: '2026-10-05',
      activePlan: makePlan('2026-10-01', [mondayEntryLate, mondayEntryEarly]),
      sessions: [],
    });

    expect(
      result.get('2026-10-05')?.map((scheduled) => scheduled.timeOfDay),
    ).toEqual(['06:00', '17:30']);
    expect(
      result
        .get('2026-10-05')
        ?.every((scheduled) => scheduled.status === 'planned'),
    ).toBe(true);
  });

  test('marks an entry completed when its session has finished', () => {
    const result = buildScheduledWorkouts({
      startDate: '2026-10-05',
      endDate: '2026-10-05',
      activePlan: makePlan('2026-10-01', [mondayEntryLate, mondayEntryEarly]),
      sessions: [makeSession(10, '2026-10-05', 2, '2026-10-05T09:00:00.000Z')],
    });

    const scheduledWorkouts = result.get('2026-10-05');
    expect(scheduledWorkouts).toHaveLength(2);
    expect(scheduledWorkouts?.[0]).toMatchObject({
      planEntryId: 2,
      status: 'completed',
      sessionId: 10,
    });
    expect(scheduledWorkouts?.[1]).toMatchObject({
      planEntryId: 1,
      status: 'planned',
      sessionId: null,
    });
  });

  test('marks an entry in progress when its session has not finished', () => {
    const result = buildScheduledWorkouts({
      startDate: '2026-10-05',
      endDate: '2026-10-05',
      activePlan: makePlan('2026-10-01', [mondayEntryEarly]),
      sessions: [makeSession(11, '2026-10-05', 2, null)],
    });

    expect(result.get('2026-10-05')).toEqual([
      expect.objectContaining({
        planEntryId: 2,
        status: 'inProgress',
        sessionId: 11,
      }),
    ]);
  });

  test('lists an unplanned session after planned entries', () => {
    const result = buildScheduledWorkouts({
      startDate: '2026-10-05',
      endDate: '2026-10-05',
      activePlan: makePlan('2026-10-01', [mondayEntryLate, mondayEntryEarly]),
      sessions: [
        makeSession(
          12,
          '2026-10-05',
          null,
          '2026-10-05T07:00:00.000Z',
          null,
          'Ad hoc',
        ),
      ],
    });

    const scheduledWorkouts = result.get('2026-10-05');
    expect(
      scheduledWorkouts?.map((scheduled) => scheduled.planEntryId),
    ).toEqual([2, 1, null]);
    expect(scheduledWorkouts?.[2]).toMatchObject({
      timeOfDay: null,
      status: 'completed',
      sessionId: 12,
      workout: { name: 'Ad hoc' },
    });
  });

  test('shows a session with no active plan as unplanned', () => {
    const result = buildScheduledWorkouts({
      startDate: '2026-10-05',
      endDate: '2026-10-05',
      activePlan: null,
      sessions: [makeSession(13, '2026-10-05', null, null)],
    });

    expect(result.get('2026-10-05')).toEqual([
      expect.objectContaining({
        planEntryId: null,
        status: 'inProgress',
        sessionId: 13,
      }),
    ]);
  });

  test('builds a week that crosses a month boundary', () => {
    const result = buildScheduledWorkouts({
      startDate: '2026-09-28',
      endDate: '2026-10-04',
      activePlan: makePlan('2026-09-01', [mondayEntryEarly, wednesdayEntry]),
      sessions: [],
    });

    expect([...result.keys()]).toEqual([
      '2026-09-28',
      '2026-09-29',
      '2026-09-30',
      '2026-10-01',
      '2026-10-02',
      '2026-10-03',
      '2026-10-04',
    ]);
    expect(
      result.get('2026-09-28')?.map((scheduled) => scheduled.planEntryId),
    ).toEqual([2]);
    expect(
      result.get('2026-09-30')?.map((scheduled) => scheduled.planEntryId),
    ).toEqual([3]);
    expect(result.get('2026-10-01')).toEqual([]);
  });

  test('lets the earliest session claim an entry and lists the rest as unplanned', () => {
    const laterSession = makeSession(21, '2026-10-05', 2, '2026-10-05T11:00:00.000Z');
    const earlierSession = {
      ...makeSession(22, '2026-10-05', 2, '2026-10-05T07:00:00.000Z'),
      startedAt: '2026-10-05T06:00:00.000Z',
    };
    const result = buildScheduledWorkouts({
      startDate: '2026-10-05',
      endDate: '2026-10-05',
      activePlan: makePlan('2026-10-01', [mondayEntryEarly]),
      sessions: [laterSession, earlierSession],
    });

    const scheduledWorkouts = result.get('2026-10-05');
    expect(scheduledWorkouts).toHaveLength(2);
    expect(scheduledWorkouts?.[0]).toMatchObject({ planEntryId: 2, sessionId: 22, status: 'completed' });
    expect(scheduledWorkouts?.[1]).toMatchObject({ planEntryId: null, sessionId: 21, timeOfDay: null });
  });

  test('returns an empty map when the start date is after the end date', () => {
    const result = buildScheduledWorkouts({
      startDate: '2026-10-07',
      endDate: '2026-10-05',
      activePlan: makePlan('2026-10-01', [mondayEntryEarly]),
      sessions: [],
    });

    expect(result.size).toBe(0);
  });
});
