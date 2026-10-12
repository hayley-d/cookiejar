import { describe, expect, test } from 'bun:test';

import {
  formatSwimDistance,
  swimBlockDistance,
  swimSectionDistance,
  swimSetDistance,
  swimWorkoutDistance,
} from '@/swimming/swimDistance';

const warmUp = { blocks: [{ rounds: 1, sets: [{ repetitions: 2, distanceMeters: 50 }] }] };
const main = {
  blocks: [
    {
      rounds: 3,
      sets: [
        { repetitions: 4, distanceMeters: 100 },
        { repetitions: 4, distanceMeters: 25 },
      ],
    },
  ],
};
const coolDown = { blocks: [{ rounds: 1, sets: [{ repetitions: 1, distanceMeters: 100 }] }] };

describe('swim distance', () => {
  test('a set is repetitions times distance', () => {
    expect(swimSetDistance({ repetitions: 4, distanceMeters: 100 })).toBe(400);
  });

  test('a block multiplies its sets by its rounds', () => {
    expect(swimBlockDistance(main.blocks[0])).toBe(1500);
  });

  test('a section adds its blocks', () => {
    expect(swimSectionDistance(warmUp)).toBe(100);
    expect(swimSectionDistance(main)).toBe(1500);
    expect(swimSectionDistance({ blocks: [...warmUp.blocks, ...coolDown.blocks] })).toBe(200);
  });

  test('the workout adds its sections', () => {
    expect(swimWorkoutDistance([warmUp, main, coolDown])).toBe(1700);
  });

  test('empty sections and workouts are zero', () => {
    expect(swimSectionDistance({ blocks: [] })).toBe(0);
    expect(swimWorkoutDistance([])).toBe(0);
  });

  test('distance is shown in metres with thousands separators', () => {
    expect(formatSwimDistance(100)).toBe('100 m');
    expect(formatSwimDistance(1700)).toBe('1,700 m');
    expect(formatSwimDistance(12500)).toBe('12,500 m');
  });
});
