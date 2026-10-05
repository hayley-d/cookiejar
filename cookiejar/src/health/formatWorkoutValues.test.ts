import { describe, expect, test } from 'bun:test';

import { formatHeartRatePair, formatKilocalories, formatWorkoutDuration } from '@/health/formatWorkoutValues';

describe('formatWorkoutValues', () => {
  test('formats average and maximum heart rate', () => {
    expect(formatHeartRatePair(141.6, 172.2)).toBe('142/172 bpm');
    expect(formatHeartRatePair(141, null)).toBe('141/— bpm');
    expect(formatHeartRatePair(null, null)).toBe('—');
  });

  test('formats kilocalories', () => {
    expect(formatKilocalories(312.4)).toBe('312 kcal');
    expect(formatKilocalories(null)).toBe('—');
  });

  test('formats duration', () => {
    expect(formatWorkoutDuration(3725)).toBe('1h 2m 5s');
    expect(formatWorkoutDuration(null)).toBe('—');
  });
});
