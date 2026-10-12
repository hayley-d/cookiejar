import { describe, expect, test } from 'bun:test';

import {
  activityHealthActivityCodes,
  activityMetricsFromHealthWorkout,
  activityTypeFromHealthActivityCode,
} from '@/activities/activityMetricsFromHealthWorkout';
import type { HealthWorkout } from '@/health/HealthTypes';

function buildWorkout(overrides: Partial<HealthWorkout> = {}): HealthWorkout {
  return {
    uuid: 'workout-1',
    activityTypeCode: 24,
    startDate: new Date(2026, 9, 10, 8, 30),
    endDate: new Date(2026, 9, 10, 11, 0),
    durationSeconds: 2 * 3600 + 30 * 60,
    activeKilocalories: 812.4,
    distanceMeters: 12345,
    elevationAscendedMeters: 640.6,
    sourceName: 'Garmin Connect',
    bundleIdentifier: 'com.garmin.connect.mobile',
    ...overrides,
  };
}

describe('activityTypeFromHealthActivityCode', () => {
  test('maps hiking, running and walking', () => {
    expect(activityTypeFromHealthActivityCode(24)).toBe('hike');
    expect(activityTypeFromHealthActivityCode(37)).toBe('run');
    expect(activityTypeFromHealthActivityCode(52)).toBe('walk');
  });

  test('returns null for other activities', () => {
    expect(activityTypeFromHealthActivityCode(50)).toBeNull();
  });

  test('lists the supported codes', () => {
    expect(activityHealthActivityCodes).toEqual([24, 37, 52]);
  });
});

describe('activityMetricsFromHealthWorkout', () => {
  test('converts units and rounds each value', () => {
    expect(activityMetricsFromHealthWorkout(buildWorkout(), 131.7)).toEqual({
      activityType: 'hike',
      startTime: new Date(2026, 9, 10, 8, 30),
      hours: 2,
      minutes: 30,
      distanceKilometers: 12.35,
      elevationGainMeters: 641,
      activeKilocalories: 812,
      averageHeartRate: 132,
    });
  });

  test('keeps missing values null', () => {
    const metrics = activityMetricsFromHealthWorkout(
      buildWorkout({ distanceMeters: null, elevationAscendedMeters: null, activeKilocalories: null }),
      null,
    );
    expect(metrics.distanceKilometers).toBeNull();
    expect(metrics.elevationGainMeters).toBeNull();
    expect(metrics.activeKilocalories).toBeNull();
    expect(metrics.averageHeartRate).toBeNull();
  });

  test('leaves the activity type null for unsupported codes', () => {
    expect(activityMetricsFromHealthWorkout(buildWorkout({ activityTypeCode: 13 }), null).activityType).toBeNull();
  });

  test('leaves empty duration parts null', () => {
    const metrics = activityMetricsFromHealthWorkout(buildWorkout({ durationSeconds: 45 * 60 }), null);
    expect(metrics.hours).toBeNull();
    expect(metrics.minutes).toBe(45);
  });
});
