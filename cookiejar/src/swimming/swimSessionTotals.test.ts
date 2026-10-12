import { describe, expect, test } from 'bun:test';

import {
  countOpenRepetitions,
  flattenSwimRepetitions,
  swumDistance,
  swumDistanceByStroke,
  type SwimRepetitionRecord,
} from '@/swimming/swimSessionTotals';

const tickedFreestyle: SwimRepetitionRecord = { strokeName: 'Freestyle', distanceMeters: 50, isCompleted: true };
const openFreestyle: SwimRepetitionRecord = { strokeName: 'Freestyle', distanceMeters: 50, isCompleted: false };
const tickedBackstroke: SwimRepetitionRecord = { strokeName: 'Backstroke', distanceMeters: 100, isCompleted: true };

describe('swumDistance', () => {
  test('is zero with nothing ticked', () => {
    expect(swumDistance([openFreestyle])).toBe(0);
  });

  test('counts only ticked repetitions', () => {
    expect(swumDistance([tickedFreestyle, openFreestyle, tickedBackstroke])).toBe(150);
  });
});

describe('swumDistanceByStroke', () => {
  test('sums ticked distance per stroke, longest first', () => {
    expect(
      swumDistanceByStroke([tickedFreestyle, tickedBackstroke, tickedFreestyle, tickedFreestyle, openFreestyle]),
    ).toEqual([
      { strokeName: 'Freestyle', distanceMeters: 150 },
      { strokeName: 'Backstroke', distanceMeters: 100 },
    ]);
  });

  test('leaves out strokes with nothing ticked', () => {
    expect(swumDistanceByStroke([openFreestyle, tickedBackstroke])).toEqual([
      { strokeName: 'Backstroke', distanceMeters: 100 },
    ]);
  });
});

describe('countOpenRepetitions', () => {
  test('counts repetitions not yet ticked', () => {
    expect(countOpenRepetitions([tickedFreestyle, openFreestyle, openFreestyle])).toBe(2);
  });
});

describe('flattenSwimRepetitions', () => {
  test('flattens ticks of every set with its stroke and distance', () => {
    const records = flattenSwimRepetitions([
      {
        blocks: [
          {
            sets: [
              {
                exerciseName: 'Freestyle',
                distanceMeters: 50,
                repetitionRows: [{ completedAt: '2026-10-12T10:00:00.000Z' }, { completedAt: null }],
              },
            ],
          },
        ],
      },
    ]);
    expect(records).toEqual([tickedFreestyle, openFreestyle]);
  });
});
