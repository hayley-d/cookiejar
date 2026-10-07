import { describe, expect, test } from 'bun:test';

import { applySuggestedWeight } from '@/sessions/applySuggestedWeight';

const suggestion = { weightKilograms: 62.5, increasedByKilograms: 2.5 };

function targets(...weights: (number | null)[]) {
  return weights.map((targetWeightKilograms) => ({ targetWeightKilograms }));
}

function weightsOf(sets: { targetWeightKilograms: number | null }[]) {
  return sets.map((set) => set.targetWeightKilograms);
}

describe('applySuggestedWeight', () => {
  test('fills sets with no target weight', () => {
    expect(weightsOf(applySuggestedWeight('repetitions_and_weight', targets(null, null), suggestion))).toEqual([
      62.5, 62.5,
    ]);
  });

  test('replaces the heaviest target weight', () => {
    expect(weightsOf(applySuggestedWeight('repetitions_and_weight', targets(60, 60), suggestion))).toEqual([
      62.5, 62.5,
    ]);
  });

  test('keeps lighter pyramid sets on their targets', () => {
    expect(weightsOf(applySuggestedWeight('repetitions_and_weight', targets(40, 50, 60, 60), suggestion))).toEqual([
      40, 50, 62.5, 62.5,
    ]);
  });

  test('fills empty sets next to lighter targets', () => {
    expect(weightsOf(applySuggestedWeight('repetitions_and_weight', targets(40, 50, null), suggestion))).toEqual([
      40, 62.5, 62.5,
    ]);
  });

  test('leaves other tracking types untouched', () => {
    const sets = targets(null, 20);
    expect(applySuggestedWeight('repetitions', sets, suggestion)).toBe(sets);
    expect(applySuggestedWeight('duration', sets, suggestion)).toBe(sets);
  });

  test('leaves sets untouched without a suggestion', () => {
    const sets = targets(60, null);
    expect(applySuggestedWeight('repetitions_and_weight', sets, null)).toBe(sets);
  });

  test('does not change the stored targets', () => {
    const sets = targets(60);
    applySuggestedWeight('repetitions_and_weight', sets, suggestion);
    expect(weightsOf(sets)).toEqual([60]);
  });
});
