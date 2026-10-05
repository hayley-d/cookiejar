import { describe, expect, test } from 'bun:test';

import { groupHealthWorkouts } from '@/health/groupHealthWorkouts';
import type { HealthWorkout } from '@/health/HealthTypes';

function buildWorkout(uuid: string, startHour: number, bundleIdentifier: string, sourceName = 'Source'): HealthWorkout {
  return {
    uuid,
    activityTypeCode: 50,
    startDate: new Date(2026, 9, 5, startHour, 0),
    endDate: new Date(2026, 9, 5, startHour + 1, 0),
    durationSeconds: 3600,
    activeKilocalories: null,
    sourceName,
    bundleIdentifier,
  };
}

describe('groupHealthWorkouts', () => {
  test('separates Garmin workouts from other sources and sorts each by start time', () => {
    const grouped = groupHealthWorkouts([
      buildWorkout('other-late', 12, 'com.apple.health'),
      buildWorkout('garmin-late', 11, 'com.garmin.connect.mobile'),
      buildWorkout('other-early', 8, 'com.apple.health'),
      buildWorkout('garmin-early', 9, 'x', 'Garmin Connect'),
    ]);
    expect(grouped.garminWorkouts.map((workout) => workout.uuid)).toEqual(['garmin-early', 'garmin-late']);
    expect(grouped.otherWorkouts.map((workout) => workout.uuid)).toEqual(['other-early', 'other-late']);
  });

  test('returns empty groups for no workouts', () => {
    expect(groupHealthWorkouts([])).toEqual({ garminWorkouts: [], otherWorkouts: [] });
  });
});
