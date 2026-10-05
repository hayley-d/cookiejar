import { describe, expect, test } from 'bun:test';

import { computeSleepMinutes, type SleepSample } from '@/health/computeSleepMinutes';

function sample(
  start: Date,
  end: Date,
  stageValue: number,
  sourceName = 'Apple Watch',
  bundleIdentifier = 'com.apple.health.1234',
): SleepSample {
  return { startDate: start, endDate: end, stageValue, sourceName, bundleIdentifier };
}

const garminName = 'Garmin Connect';
const garminBundle = 'com.garmin.connect.mobile';

describe('computeSleepMinutes', () => {
  test('returns null when there are no samples', () => {
    expect(computeSleepMinutes([])).toBeNull();
  });

  test('returns null when only in-bed and awake samples exist', () => {
    const samples = [
      sample(new Date(2026, 9, 4, 22, 0), new Date(2026, 9, 5, 6, 0), 0),
      sample(new Date(2026, 9, 5, 3, 0), new Date(2026, 9, 5, 3, 30), 2),
    ];
    expect(computeSleepMinutes(samples)).toBeNull();
  });

  test('excludes in-bed and awake but counts every asleep stage', () => {
    const samples = [
      sample(new Date(2026, 9, 4, 22, 0), new Date(2026, 9, 5, 7, 0), 0),
      sample(new Date(2026, 9, 4, 23, 0), new Date(2026, 9, 5, 0, 0), 1),
      sample(new Date(2026, 9, 5, 0, 0), new Date(2026, 9, 5, 2, 0), 3),
      sample(new Date(2026, 9, 5, 2, 0), new Date(2026, 9, 5, 2, 30), 2),
      sample(new Date(2026, 9, 5, 2, 30), new Date(2026, 9, 5, 4, 0), 4),
      sample(new Date(2026, 9, 5, 4, 0), new Date(2026, 9, 5, 5, 0), 5),
    ];
    expect(computeSleepMinutes(samples)).toBe(60 + 120 + 90 + 60);
  });

  test('sums a night that crosses midnight', () => {
    const samples = [sample(new Date(2026, 9, 4, 23, 30), new Date(2026, 9, 5, 6, 45), 3)];
    expect(computeSleepMinutes(samples)).toBe(7 * 60 + 15);
  });

  test('merges overlapping samples from two sources so nothing is counted twice', () => {
    const samples = [
      sample(new Date(2026, 9, 4, 23, 0), new Date(2026, 9, 5, 5, 0), 3, 'Apple Watch', 'com.apple.health.1'),
      sample(new Date(2026, 9, 5, 3, 0), new Date(2026, 9, 5, 7, 0), 3, 'Sleep App', 'com.example.sleep'),
    ];
    expect(computeSleepMinutes(samples)).toBe(8 * 60);
  });

  test('merges a sample that sits inside a longer one', () => {
    const samples = [
      sample(new Date(2026, 9, 4, 23, 0), new Date(2026, 9, 5, 6, 0), 3),
      sample(new Date(2026, 9, 5, 1, 0), new Date(2026, 9, 5, 2, 0), 4, 'Sleep App', 'com.example.sleep'),
    ];
    expect(computeSleepMinutes(samples)).toBe(7 * 60);
  });

  test('uses only Garmin samples when any Garmin sample exists', () => {
    const samples = [
      sample(new Date(2026, 9, 4, 22, 0), new Date(2026, 9, 5, 7, 0), 3, 'Apple Watch', 'com.apple.health.1'),
      sample(new Date(2026, 9, 4, 23, 0), new Date(2026, 9, 5, 6, 0), 3, garminName, garminBundle),
    ];
    expect(computeSleepMinutes(samples)).toBe(7 * 60);
  });

  test('ignores a Garmin in-bed sample and falls back to the other asleep samples', () => {
    const samples = [
      sample(new Date(2026, 9, 4, 22, 0), new Date(2026, 9, 5, 7, 0), 0, garminName, garminBundle),
      sample(new Date(2026, 9, 4, 23, 0), new Date(2026, 9, 5, 6, 0), 3, 'Apple Watch', 'com.apple.health.1'),
    ];
    expect(computeSleepMinutes(samples)).toBe(7 * 60);
  });

  test('rounds to whole minutes', () => {
    const samples = [sample(new Date(2026, 9, 5, 1, 0, 0), new Date(2026, 9, 5, 1, 10, 40), 3)];
    expect(computeSleepMinutes(samples)).toBe(11);
  });
});
