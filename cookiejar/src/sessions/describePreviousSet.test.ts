import { describe, expect, test } from 'bun:test';

import { describePreviousSet, matchPreviousSets, type PreviousSessionSet } from '@/sessions/describePreviousSet';
import type { TargetSetValues } from '@/workouts/targetSetColumns';

function makeValues(changes: Partial<TargetSetValues>): TargetSetValues {
  return { repetitions: null, weightKilograms: null, durationSeconds: null, distanceMeters: null, ...changes };
}

function makePreviousSet(position: number, repetitions: number): PreviousSessionSet {
  return { position, ...makeValues({ repetitions }) };
}

describe('matchPreviousSets', () => {
  test('matches earlier sets to this sessions sets by position', () => {
    const previousSets = [makePreviousSet(1, 8), makePreviousSet(2, 6)];
    expect(matchPreviousSets([{ position: 1 }, { position: 2 }, { position: 3 }], previousSets)).toEqual([
      previousSets[0] ?? null,
      previousSets[1] ?? null,
      null,
    ]);
  });

  test('a gap in the earlier positions leaves that position without a match', () => {
    const previousSets = [makePreviousSet(1, 8), makePreviousSet(3, 5)];
    const matched = matchPreviousSets([{ position: 1 }, { position: 2 }, { position: 3 }], previousSets);
    expect(matched[0]).toEqual(previousSets[0] ?? null);
    expect(matched[1]).toBeNull();
    expect(matched[2]).toEqual(previousSets[1] ?? null);
  });

  test('ignores earlier sets beyond this sessions sets', () => {
    const previousSets = [makePreviousSet(1, 8), makePreviousSet(2, 6)];
    expect(matchPreviousSets([{ position: 1 }], previousSets)).toEqual([previousSets[0] ?? null]);
  });

  test('has no match for any set when there is no earlier session', () => {
    expect(matchPreviousSets([{ position: 1 }, { position: 2 }], [])).toEqual([null, null]);
  });
});

describe('describePreviousSet', () => {
  test('shows weight times repetitions', () => {
    expect(describePreviousSet('repetitions_and_weight', makeValues({ weightKilograms: 60, repetitions: 8 }))).toBe(
      '60 × 8',
    );
  });

  test('shows repetitions alone when there is no weight', () => {
    expect(describePreviousSet('repetitions_and_weight', makeValues({ repetitions: 8 }))).toBe('8');
    expect(describePreviousSet('repetitions', makeValues({ repetitions: 12 }))).toBe('12');
  });

  test('shows a duration', () => {
    expect(describePreviousSet('duration', makeValues({ durationSeconds: 60 }))).toBe('1m');
    expect(describePreviousSet('duration', makeValues({ durationSeconds: 75 }))).toBe('1m 15s');
  });

  test('shows a distance in metres or kilometres', () => {
    expect(describePreviousSet('distance', makeValues({ distanceMeters: 500 }))).toBe('500 m');
    expect(describePreviousSet('distance', makeValues({ distanceMeters: 2500 }))).toBe('2.5 km');
  });

  test('shows a dash without a previous set or a matching value', () => {
    expect(describePreviousSet('repetitions', null)).toBe('—');
    expect(describePreviousSet('duration', makeValues({ repetitions: 8 }))).toBe('—');
  });
});
