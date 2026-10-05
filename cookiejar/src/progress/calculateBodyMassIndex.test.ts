import { describe, expect, test } from 'bun:test';

import { calculateBodyMassIndex } from '@/progress/calculateBodyMassIndex';

describe('calculateBodyMassIndex', () => {
  test('divides weight by height in metres squared, to one decimal place', () => {
    expect(calculateBodyMassIndex(70, 175)).toBe(22.9);
    expect(calculateBodyMassIndex(72.4, 168.5)).toBe(25.5);
  });

  test('is null when the height is missing or zero', () => {
    expect(calculateBodyMassIndex(70, null)).toBeNull();
    expect(calculateBodyMassIndex(70, 0)).toBeNull();
  });

  test('is null when the weight is missing', () => {
    expect(calculateBodyMassIndex(null, 175)).toBeNull();
  });
});
