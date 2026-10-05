import { describe, expect, test } from 'bun:test';

import { createCoachSnapshot } from '@/coach/coachSnapshotFixture';
import { noRecentWeighIn, noRecentWeighInPriority } from '@/coach/rules/noRecentWeighIn';
import type { BodyMeasurement } from '@/types/BodyMeasurement';
import type { FitnessGoal, Profile } from '@/types/Profile';

function profileWith(goal: FitnessGoal | null): Profile {
  return {
    id: 1,
    displayName: null,
    birthDate: null,
    sex: null,
    heightCentimetres: null,
    goal,
    weeklyWorkoutTarget: 3,
    dailyStepGoal: 8000,
    updatedAt: '',
  };
}

function measurementOn(measuredOn: string): BodyMeasurement {
  return {
    id: 1,
    measuredOn,
    weightKilograms: 80,
    bodyFatPercent: null,
    waistCentimetres: null,
    hipCentimetres: null,
    chestCentimetres: null,
    notes: null,
  };
}

function insightsFor(goal: FitnessGoal | null, measuredOn: string | null) {
  return noRecentWeighIn(
    createCoachSnapshot({
      profile: profileWith(goal),
      latestBodyMeasurement: measuredOn === null ? null : measurementOn(measuredOn),
    }),
  );
}

describe('noRecentWeighIn', () => {
  test('fires for the improvement topic with the coach nuggie and an add measurement action', () => {
    const insights = insightsFor('weight_loss', '2026-09-20');
    expect(insights).toHaveLength(1);
    expect(insights[0]).toMatchObject({
      ruleIdentifier: 'noRecentWeighIn',
      topics: ['improvement'],
      priority: noRecentWeighInPriority,
      nuggie: 'coach',
      action: { destination: { screen: 'addMeasurement' } },
    });
    expect(noRecentWeighInPriority).toBe(40);
  });

  test('fires when there is no measurement at all', () => {
    expect(insightsFor('hypertrophy', null)).toHaveLength(1);
  });

  test('a measurement exactly fourteen days ago does not fire', () => {
    expect(insightsFor('weight_loss', '2026-09-23')).toEqual([]);
  });

  test('a measurement fifteen days ago fires', () => {
    expect(insightsFor('weight_loss', '2026-09-22')).toHaveLength(1);
  });

  test('a measurement today does not fire', () => {
    expect(insightsFor('weight_loss', '2026-10-07')).toEqual([]);
  });

  test('fires only for the weight_loss and hypertrophy goals', () => {
    expect(insightsFor('hypertrophy', null)).toHaveLength(1);
    expect(insightsFor('weight_loss', null)).toHaveLength(1);
    expect(insightsFor('strength', null)).toEqual([]);
    expect(insightsFor('endurance', null)).toEqual([]);
    expect(insightsFor('general_fitness', null)).toEqual([]);
    expect(insightsFor(null, null)).toEqual([]);
  });

  test('does not fire without a profile', () => {
    expect(noRecentWeighIn(createCoachSnapshot())).toEqual([]);
  });
});
