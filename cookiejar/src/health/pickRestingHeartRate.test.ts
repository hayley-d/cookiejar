import { describe, expect, test } from 'bun:test';

import { pickRestingHeartRate } from '@/health/pickRestingHeartRate';

const dayStart = new Date(2026, 9, 5, 0, 0);
const dayEnd = new Date(2026, 9, 6, 0, 0);

describe('pickRestingHeartRate', () => {
  test('returns null when there are no samples', () => {
    expect(pickRestingHeartRate([], dayStart, dayEnd)).toBeNull();
  });

  test('picks the most recent sample that starts on the date', () => {
    const samples = [
      { startDate: new Date(2026, 9, 5, 7, 0), beatsPerMinute: 52 },
      { startDate: new Date(2026, 9, 5, 14, 0), beatsPerMinute: 55 },
      { startDate: new Date(2026, 9, 5, 9, 0), beatsPerMinute: 53 },
    ];
    expect(pickRestingHeartRate(samples, dayStart, dayEnd)).toBe(55);
  });

  test('ignores samples from other days', () => {
    const samples = [
      { startDate: new Date(2026, 9, 4, 23, 59), beatsPerMinute: 50 },
      { startDate: new Date(2026, 9, 6, 0, 0), beatsPerMinute: 60 },
    ];
    expect(pickRestingHeartRate(samples, dayStart, dayEnd)).toBeNull();
  });

  test('includes a sample at local midnight and rounds the value', () => {
    const samples = [{ startDate: new Date(2026, 9, 5, 0, 0), beatsPerMinute: 54.4 }];
    expect(pickRestingHeartRate(samples, dayStart, dayEnd)).toBe(54);
  });
});
