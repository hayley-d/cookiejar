import { describe, expect, test } from 'bun:test';

import type { FinishedSessionWithSets } from '@/coach/CoachSnapshot';
import { createCoachSnapshot } from '@/coach/coachSnapshotFixture';
import { trainingLoadSpike, trainingLoadSpikePriority } from '@/coach/rules/trainingLoadSpike';

function sessionOn(date: Date, weightKilograms: number, repetitions: number): FinishedSessionWithSets {
  return {
    sessionId: date.getTime(),
    startedAt: date.toISOString(),
    workoutName: 'Session',
    sets: [
      {
        exerciseId: 1,
        trackingType: 'repetitions_and_weight',
        repetitions,
        weightKilograms,
        durationSeconds: null,
        distanceMeters: null,
      },
    ],
  };
}

const previousWeekVolumeOfThousand = [sessionOn(new Date(2026, 8, 29, 18, 0), 100, 10)];
const previousFourWeekAverageOfThousand = [
  sessionOn(new Date(2026, 8, 8, 18, 0), 100, 10),
  sessionOn(new Date(2026, 8, 15, 18, 0), 100, 10),
  sessionOn(new Date(2026, 8, 22, 18, 0), 100, 10),
  sessionOn(new Date(2026, 8, 29, 18, 0), 100, 10),
];

function thisWeek(weightKilograms: number, repetitions: number) {
  return sessionOn(new Date(2026, 9, 6, 18, 0), weightKilograms, repetitions);
}

function insightsFor(sessions: FinishedSessionWithSets[]) {
  return trainingLoadSpike(createCoachSnapshot({ sessionsLastTwelveWeeks: sessions }));
}

describe('trainingLoadSpike', () => {
  test('fires for the recovery topic with the coach nuggie and no action', () => {
    const insights = insightsFor([...previousFourWeekAverageOfThousand, thisWeek(100, 16)]);
    expect(insights).toHaveLength(1);
    expect(insights[0]).toMatchObject({
      ruleIdentifier: 'trainingLoadSpike',
      topics: ['recovery'],
      priority: trainingLoadSpikePriority,
      nuggie: 'coach',
      action: null,
    });
    expect(trainingLoadSpikePriority).toBe(65);
  });

  test('exactly 1.5 times the average does not fire', () => {
    expect(insightsFor([...previousFourWeekAverageOfThousand, thisWeek(100, 15)])).toEqual([]);
  });

  test('just over 1.5 times the average fires', () => {
    expect(insightsFor([...previousFourWeekAverageOfThousand, thisWeek(100, 15.1)])).toHaveLength(1);
  });

  test('the average includes zero-volume weeks', () => {
    expect(insightsFor([...previousWeekVolumeOfThousand, thisWeek(100, 4)])).toHaveLength(1);
    expect(insightsFor([...previousWeekVolumeOfThousand, thisWeek(100, 3.75)])).toEqual([]);
  });

  test('never fires when the previous average is zero', () => {
    expect(insightsFor([thisWeek(100, 20)])).toEqual([]);
  });

  test('ignores sessions older than four weeks before this week', () => {
    expect(insightsFor([sessionOn(new Date(2026, 8, 1, 18, 0), 100, 10), thisWeek(100, 20)])).toEqual([]);
  });

  test('ignores sets that are not weighted repetitions', () => {
    const durationSession: FinishedSessionWithSets = {
      ...thisWeek(1, 1),
      sets: [
        {
          exerciseId: 2,
          trackingType: 'duration',
          repetitions: 50,
          weightKilograms: 100,
          durationSeconds: 60,
          distanceMeters: null,
        },
      ],
    };
    expect(insightsFor([...previousFourWeekAverageOfThousand, durationSession])).toEqual([]);
  });
});

describe('trainingLoadSpike copy', () => {
  test('shows the rise as a percentage in both variants', () => {
    const sessions = [...previousFourWeekAverageOfThousand, thisWeek(100, 16)];
    expect(insightsFor(sessions)[0].messages).toEqual([
      '60% more volume than your usual week. Not noopy for your joints, watch for niggles.',
    ]);
    const alternate = trainingLoadSpike(createCoachSnapshot({ now: new Date(2026, 9, 8, 9, 0), sessionsLastTwelveWeeks: sessions }));
    expect(alternate[0].messages).toEqual(['Big jump! 60% more volume this week than usual. Ease in and watch for niggles.']);
  });
});
