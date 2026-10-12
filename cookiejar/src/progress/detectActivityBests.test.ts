import { describe, expect, test } from 'bun:test';

import { describeActivityBest, detectActivityBests } from '@/progress/detectActivityBests';
import type { ActivityLog } from '@/types/ActivityLog';

function buildLog(overrides: Partial<ActivityLog> = {}): ActivityLog {
  return {
    activityType: 'hike',
    startedAt: '2026-10-01T08:00:00.000Z',
    durationSeconds: 3600,
    distanceMeters: 5000,
    elevationGainMeters: 200,
    ...overrides,
  };
}

describe('detectActivityBests', () => {
  test('the first log of a type is not a best', () => {
    expect(detectActivityBests(buildLog(), [])).toEqual([]);
  });

  test('logs of another type do not count as earlier logs', () => {
    expect(detectActivityBests(buildLog(), [buildLog({ activityType: 'run', distanceMeters: 1000 })])).toEqual([]);
  });

  test('a longer distance is a longest distance best', () => {
    expect(
      detectActivityBests(buildLog({ distanceMeters: 8000, elevationGainMeters: 100, durationSeconds: 8000 }), [
        buildLog(),
      ]),
    ).toEqual(['longestDistance']);
  });

  test('more elevation is a most elevation best', () => {
    expect(
      detectActivityBests(buildLog({ elevationGainMeters: 500, durationSeconds: 7200 }), [buildLog()]),
    ).toEqual(['mostElevation']);
  });

  test('a faster pace over at least a kilometre is a fastest pace best', () => {
    expect(detectActivityBests(buildLog({ durationSeconds: 3000 }), [buildLog()])).toEqual(['fastestPace']);
  });

  test('a faster pace over less than a kilometre is not a best', () => {
    expect(
      detectActivityBests(buildLog({ distanceMeters: 900, durationSeconds: 60, elevationGainMeters: null }), [
        buildLog(),
      ]),
    ).toEqual([]);
  });

  test('ties are not a new best', () => {
    expect(detectActivityBests(buildLog(), [buildLog()])).toEqual([]);
  });

  test('can set several bests at once', () => {
    expect(
      detectActivityBests(buildLog({ distanceMeters: 9000, elevationGainMeters: 900, durationSeconds: 3000 }), [
        buildLog(),
      ]),
    ).toEqual(['longestDistance', 'mostElevation', 'fastestPace']);
  });

  test('missing metrics never set a best', () => {
    expect(
      detectActivityBests(buildLog({ distanceMeters: null, elevationGainMeters: null }), [buildLog()]),
    ).toEqual([]);
  });

  test('compares against the best of all earlier logs', () => {
    expect(
      detectActivityBests(buildLog({ distanceMeters: 6000, durationSeconds: 9000 }), [
        buildLog({ distanceMeters: 4000 }),
        buildLog({ distanceMeters: 7000 }),
      ]),
    ).toEqual([]);
  });
});

describe('describeActivityBest', () => {
  test('names the best for the activity type', () => {
    expect(describeActivityBest('longestDistance', 'hike')).toBe('Longest hike');
    expect(describeActivityBest('longestDistance', 'run')).toBe('Longest run');
    expect(describeActivityBest('mostElevation', 'walk')).toBe('Most elevation');
    expect(describeActivityBest('fastestPace', 'run')).toBe('Fastest pace');
  });
});
