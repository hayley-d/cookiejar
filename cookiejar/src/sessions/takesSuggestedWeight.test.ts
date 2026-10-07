import { describe, expect, test } from 'bun:test';

import { takesSuggestedWeight } from '@/sessions/takesSuggestedWeight';

function targets(...weights: (number | null)[]) {
  return weights.map((targetWeightKilograms) => ({ targetWeightKilograms }));
}

describe('takesSuggestedWeight', () => {
  test('sets with no target weight take it', () => {
    const sets = targets(40, null);
    expect(takesSuggestedWeight(sets[1], sets)).toBe(true);
  });

  test('the heaviest target weight takes it', () => {
    const sets = targets(40, 60);
    expect(takesSuggestedWeight(sets[1], sets)).toBe(true);
  });

  test('lighter target weights keep their own', () => {
    const sets = targets(40, 60);
    expect(takesSuggestedWeight(sets[0], sets)).toBe(false);
  });
});
