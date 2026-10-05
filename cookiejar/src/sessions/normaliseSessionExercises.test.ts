import { describe, expect, test } from 'bun:test';

import { normaliseSessionExercises } from '@/sessions/normaliseSessionExercises';

describe('normaliseSessionExercises', () => {
  test('clears a group left with a single member', () => {
    const result = normaliseSessionExercises([
      { id: 4, supersetGroup: 'A' },
      { id: 7, supersetGroup: null },
    ]);
    expect(result).toEqual([
      { id: 4, position: 0, supersetGroup: null },
      { id: 7, position: 1, supersetGroup: null },
    ]);
  });

  test('renumbers positions from zero and keeps intact groups', () => {
    const result = normaliseSessionExercises([
      { id: 3, supersetGroup: 'B' },
      { id: 9, supersetGroup: 'B' },
      { id: 12, supersetGroup: null },
    ]);
    expect(result).toEqual([
      { id: 3, position: 0, supersetGroup: 'A' },
      { id: 9, position: 1, supersetGroup: 'A' },
      { id: 12, position: 2, supersetGroup: null },
    ]);
  });
});
