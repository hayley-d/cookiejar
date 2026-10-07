import { describe, expect, test } from 'bun:test';

import { suggestNextLoad, type SuggestionSet } from '@/progress/suggestNextLoad';

function makeSession(weightKilograms: number | null, ...repetitions: (number | null)[]): SuggestionSet[] {
  return repetitions.map((setRepetitions) => ({ weightKilograms, repetitions: setRepetitions }));
}

describe('suggestNextLoad', () => {
  test('no history gives no suggestion', () => {
    expect(suggestNextLoad([], 12)).toBeNull();
  });

  test('one session holds the working weight with no increase', () => {
    expect(suggestNextLoad([makeSession(60, 12, 12)], 12)).toEqual({
      weightKilograms: 60,
      increasedByKilograms: null,
    });
  });

  test('two sessions hold the working weight with no increase', () => {
    const sessions = [makeSession(60, 12, 12), makeSession(60, 12, 12)];
    expect(suggestNextLoad(sessions, 12)).toEqual({ weightKilograms: 60, increasedByKilograms: null });
  });

  test('three sessions averaging the top add one step', () => {
    const sessions = [makeSession(60, 12, 12), makeSession(60, 12, 12), makeSession(60, 12, 12)];
    expect(suggestNextLoad(sessions, 12)).toEqual({ weightKilograms: 62.5, increasedByKilograms: 2.5 });
  });

  test('a weak middle session that still averages the top increases', () => {
    const sessions = [makeSession(60, 13, 13), makeSession(60, 10, 10), makeSession(60, 13, 13)];
    expect(suggestNextLoad(sessions, 12)).toEqual({ weightKilograms: 62.5, increasedByKilograms: 2.5 });
  });

  test('a weak session that drags the average below the top holds', () => {
    const sessions = [makeSession(60, 12, 12), makeSession(60, 9, 9), makeSession(60, 12, 12)];
    expect(suggestNextLoad(sessions, 12)).toEqual({ weightKilograms: 60, increasedByKilograms: null });
  });

  test('a weak latest session never lowers the weight', () => {
    const sessions = [makeSession(60, 5, 5), makeSession(60, 12, 12), makeSession(60, 12, 12)];
    expect(suggestNextLoad(sessions, 12)).toEqual({ weightKilograms: 60, increasedByKilograms: null });
  });

  test('a lighter earlier session holds the working weight', () => {
    const sessions = [makeSession(60, 12, 12), makeSession(57.5, 12, 12), makeSession(60, 12, 12)];
    expect(suggestNextLoad(sessions, 12)).toEqual({ weightKilograms: 60, increasedByKilograms: null });
  });

  test('the step is 1 kg below 20 kg', () => {
    const sessions = [makeSession(15, 12), makeSession(15, 12), makeSession(15, 12)];
    expect(suggestNextLoad(sessions, 12)).toEqual({ weightKilograms: 16, increasedByKilograms: 1 });
  });

  test('the step is 2.5 kg from 20 kg', () => {
    const sessions = [makeSession(20, 12), makeSession(20, 12), makeSession(20, 12)];
    expect(suggestNextLoad(sessions, 12)).toEqual({ weightKilograms: 22.5, increasedByKilograms: 2.5 });
  });

  test('sets without weight are ignored', () => {
    const sessions = [
      [...makeSession(null, 20), ...makeSession(0, 20), ...makeSession(60, 12)],
      makeSession(60, 12),
      makeSession(60, 12),
    ];
    expect(suggestNextLoad(sessions, 12)).toEqual({ weightKilograms: 62.5, increasedByKilograms: 2.5 });
  });

  test('sessions with no weighted sets are skipped', () => {
    expect(suggestNextLoad([makeSession(null, 12), makeSession(60, 12)], 12)).toEqual({
      weightKilograms: 60,
      increasedByKilograms: null,
    });
  });

  test('a session with mixed weights uses its heaviest', () => {
    const sessions = [
      [...makeSession(40, 12), ...makeSession(60, 12)],
      makeSession(60, 12),
      makeSession(60, 12),
    ];
    expect(suggestNextLoad(sessions, 12)).toEqual({ weightKilograms: 62.5, increasedByKilograms: 2.5 });
  });

  test('lighter sets in a session do not count towards the average', () => {
    const sessions = [
      [...makeSession(40, 1), ...makeSession(60, 12)],
      makeSession(60, 12),
      makeSession(60, 12),
    ];
    expect(suggestNextLoad(sessions, 12)?.increasedByKilograms).toBe(2.5);
  });

  test('only the three newest sessions count', () => {
    const sessions = [makeSession(60, 12), makeSession(60, 12), makeSession(60, 12), makeSession(60, 1)];
    expect(suggestNextLoad(sessions, 12)).toEqual({ weightKilograms: 62.5, increasedByKilograms: 2.5 });
  });

  test('missing repetitions count as zero', () => {
    const sessions = [makeSession(60, 12, null), makeSession(60, 12, 12), makeSession(60, 12, 12)];
    expect(suggestNextLoad(sessions, 12)?.increasedByKilograms).toBeNull();
  });
});
