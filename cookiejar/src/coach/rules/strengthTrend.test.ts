import { describe, expect, test } from 'bun:test';

import type { FinishedSessionWithSets } from '@/coach/CoachSnapshot';
import { createCoachSnapshot } from '@/coach/coachSnapshotFixture';
import { strengthTrend, strengthTrendPriority } from '@/coach/rules/strengthTrend';
import type { CompletedSet } from '@/progress/detectPersonalRecords';
import type { Exercise } from '@/types/Exercise';

const squat: Exercise = {
  id: 2,
  name: 'Squat',
  bodyPart: 'quadriceps',
  imageUrl: null,
  notes: null,
  defaultTrackingType: 'repetitions_and_weight',
  createdAt: '',
};

const bench: Exercise = {
  ...squat,
  id: 1,
  name: 'Bench Press',
  bodyPart: 'chest',
};

const exercisesById = new Map([
  [1, bench],
  [2, squat],
]);

function weightedSet(exerciseId: number, weightKilograms: number, repetitions: number): CompletedSet {
  return {
    exerciseId,
    trackingType: 'repetitions_and_weight',
    repetitions,
    weightKilograms,
    durationSeconds: null,
    distanceMeters: null,
  };
}

function sessionOn(sessionId: number, startedAt: Date, sets: CompletedSet[]): FinishedSessionWithSets {
  return {
    sessionId,
    startedAt: startedAt.toISOString(),
    workoutName: 'Session',
    sets,
  };
}

function squatSessions(weights: number[], repetitions = 5): FinishedSessionWithSets[] {
  return weights.map((weightKilograms, index) =>
    sessionOn(index + 1, new Date(2026, 8, 10 + index * 5, 18, 0), [weightedSet(2, weightKilograms, repetitions)]),
  );
}

function trendMessages(sessions: FinishedSessionWithSets[]) {
  return strengthTrend(createCoachSnapshot({ exercisesById, sessionsLastTwelveWeeks: sessions })).flatMap(
    (insight) => insight.messages,
  );
}

describe('strengthTrend', () => {
  test('fires with the analytics nuggie and a button to the exercise history', () => {
    const insights = strengthTrend(
      createCoachSnapshot({
        exercisesById,
        sessionsLastTwelveWeeks: squatSessions([100, 102, 104, 106]),
      }),
    );
    expect(insights).toHaveLength(1);
    expect(insights[0]).toMatchObject({
      ruleIdentifier: 'strengthTrend',
      topics: ['progress'],
      priority: strengthTrendPriority,
      nuggie: 'analytics',
      messages: ['Ohh my noops, Squat up 6% in 8 weeks 📈'],
      action: {
        label: 'See Squat history',
        destination: { screen: 'exerciseHistory', exerciseId: 2 },
      },
    });
    expect(strengthTrendPriority).toBe(30);
  });

  test('fires on exactly 4 sessions and not on 3', () => {
    expect(trendMessages(squatSessions([100, 102, 104, 106]))).toHaveLength(1);
    expect(trendMessages(squatSessions([100, 104, 106]))).toEqual([]);
  });

  test('fires on a rise of exactly 2.5 percent and not just under it', () => {
    expect(trendMessages(squatSessions([100, 90, 95, 102.5]))).toHaveLength(1);
    expect(trendMessages(squatSessions([100, 90, 95, 102.4]))).toEqual([]);
  });

  test('does not fire when the estimate fell or stayed flat', () => {
    expect(trendMessages(squatSessions([100, 100, 100, 100]))).toEqual([]);
    expect(trendMessages(squatSessions([100, 110, 120, 90]))).toEqual([]);
  });

  test('compares the first session with the last, not the best session', () => {
    expect(trendMessages(squatSessions([100, 130, 130, 101]))).toEqual([]);
  });

  test('uses the best set of each session', () => {
    const sessions = squatSessions([100, 100, 100, 100]);
    sessions[3] = { ...sessions[3], sets: [...sessions[3].sets, weightedSet(2, 110, 5)] };
    expect(trendMessages(sessions)).toHaveLength(1);
  });

  test('ignores sets above 12 repetitions', () => {
    const sessions = squatSessions([100, 100, 100, 100]);
    sessions[3] = { ...sessions[3], sets: [...sessions[3].sets, weightedSet(2, 200, 13)] };
    expect(trendMessages(sessions)).toEqual([]);
    const twelveRepetitionSessions = squatSessions([100, 100, 100, 100]);
    twelveRepetitionSessions[3] = {
      ...twelveRepetitionSessions[3],
      sets: [...twelveRepetitionSessions[3].sets, weightedSet(2, 200, 12)],
    };
    expect(trendMessages(twelveRepetitionSessions)).toHaveLength(1);
  });

  test('ignores sessions older than 8 weeks', () => {
    const sessions = squatSessions([100, 102, 104, 106]);
    sessions[0] = sessionOn(1, new Date(2026, 7, 1, 18, 0), [weightedSet(2, 100, 5)]);
    expect(trendMessages(sessions)).toEqual([]);
  });

  test('counts a session on the first day of the 8-week window', () => {
    const sessions = squatSessions([100, 102, 104, 106]);
    sessions[0] = sessionOn(1, new Date(2026, 7, 17, 0, 0), [weightedSet(2, 100, 5)]);
    expect(trendMessages(sessions)).toHaveLength(1);
    sessions[0] = sessionOn(1, new Date(2026, 7, 16, 23, 59), [weightedSet(2, 100, 5)]);
    expect(trendMessages(sessions)).toEqual([]);
  });

  test('lists the biggest risers first, up to three', () => {
    const benchSessions = [100, 103, 106, 110].map((weightKilograms, index) =>
      sessionOn(10 + index, new Date(2026, 8, 12 + index * 5, 18, 0), [weightedSet(1, weightKilograms, 5)]),
    );
    const messages = trendMessages([...squatSessions([100, 102, 104, 106]), ...benchSessions]);
    expect(messages).toEqual(['Ohh my noops, Bench Press up 10% in 8 weeks 📈', 'Ohh my noops, Squat up 6% in 8 weeks 📈']);
  });

  test('skips an exercise missing from the library', () => {
    expect(
      strengthTrend(
        createCoachSnapshot({
          sessionsLastTwelveWeeks: squatSessions([100, 102, 104, 106]),
        }),
      ),
    ).toEqual([]);
  });
});
