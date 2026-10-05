import { describe, expect, test } from 'bun:test';

import { findSuggestedHealthWorkout } from '@/health/findSuggestedHealthWorkout';
import type { HealthWorkout } from '@/health/HealthTypes';

const sessionStart = new Date(2026, 9, 5, 10, 0);
const sessionEnd = new Date(2026, 9, 5, 11, 0);
const garminBundleIdentifier = 'com.garmin.connect.mobile';

function buildWorkout(
  uuid: string,
  startMinute: number,
  endMinute: number,
  bundleIdentifier = garminBundleIdentifier,
  sourceName = 'Source',
): HealthWorkout {
  return {
    uuid,
    activityTypeCode: 50,
    startDate: new Date(2026, 9, 5, 10, startMinute),
    endDate: new Date(2026, 9, 5, 10, endMinute),
    durationSeconds: (endMinute - startMinute) * 60,
    activeKilocalories: null,
    sourceName,
    bundleIdentifier,
  };
}

describe('findSuggestedHealthWorkout', () => {
  test('returns the single qualifying Garmin workout', () => {
    const workout = buildWorkout('only', 0, 55);
    expect(findSuggestedHealthWorkout(sessionStart, sessionEnd, [workout])).toBe(workout);
  });

  test('returns null when there are no workouts', () => {
    expect(findSuggestedHealthWorkout(sessionStart, sessionEnd, [])).toBeNull();
  });

  test('returns null when two workouts qualify', () => {
    const workouts = [buildWorkout('first', 0, 30), buildWorkout('second', 30, 60)];
    expect(findSuggestedHealthWorkout(sessionStart, sessionEnd, workouts)).toBeNull();
  });

  test('ignores a non-Garmin workout with full overlap', () => {
    const workout = buildWorkout('apple', 0, 60, 'com.apple.health', 'Apple Watch');
    expect(findSuggestedHealthWorkout(sessionStart, sessionEnd, [workout])).toBeNull();
  });

  test('suggests the Garmin workout when a non-Garmin workout also overlaps', () => {
    const garminWorkout = buildWorkout('garmin', 0, 60);
    const appleWorkout = buildWorkout('apple', 0, 60, 'com.apple.health', 'Apple Watch');
    expect(findSuggestedHealthWorkout(sessionStart, sessionEnd, [appleWorkout, garminWorkout])).toBe(garminWorkout);
  });

  test('qualifies at exactly 50 percent overlap', () => {
    const workout = buildWorkout('half', 30, 90);
    expect(findSuggestedHealthWorkout(sessionStart, sessionEnd, [workout])).toBe(workout);
  });

  test('does not qualify just under 50 percent overlap', () => {
    const workout = new Date(2026, 9, 5, 10, 30, 1);
    const justUnderHalf: HealthWorkout = {
      ...buildWorkout('under', 30, 90),
      startDate: workout,
    };
    expect(findSuggestedHealthWorkout(sessionStart, sessionEnd, [justUnderHalf])).toBeNull();
  });

  test('qualifies when the workout extends past both ends of the session', () => {
    const workout = buildWorkout('wide', -30, 120);
    expect(findSuggestedHealthWorkout(sessionStart, sessionEnd, [workout])).toBe(workout);
  });

  test('returns null when the workout does not overlap at all', () => {
    expect(findSuggestedHealthWorkout(sessionStart, sessionEnd, [buildWorkout('later', 70, 100)])).toBeNull();
  });

  test('returns null for a zero-duration session', () => {
    const workout = buildWorkout('any', 0, 60);
    expect(findSuggestedHealthWorkout(sessionStart, sessionStart, [workout])).toBeNull();
  });

  test('returns null for a negative-duration session', () => {
    const workout = buildWorkout('any', 0, 60);
    expect(findSuggestedHealthWorkout(sessionEnd, sessionStart, [workout])).toBeNull();
  });
});
