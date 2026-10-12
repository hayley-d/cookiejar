import { describe, expect, test } from 'bun:test';

import {
  activityLogDistanceMeters,
  activityLogDurationSeconds,
  validateActivityLogForm,
  type ActivityLogFormValues,
} from '@/activities/validateActivityLogForm';

const baseValues: ActivityLogFormValues = {
  activityType: 'run',
  date: '2026-10-11',
  startTime: new Date(2026, 9, 11, 7, 0),
  hours: 0,
  minutes: 55,
  distanceKilometers: 10,
  elevationGainMeters: null,
  activeKilocalories: null,
  averageHeartRate: null,
  notes: '',
};

describe('activityLogDurationSeconds', () => {
  test('adds hours and minutes, treating blanks as zero', () => {
    expect(activityLogDurationSeconds(baseValues)).toBe(3300);
    expect(activityLogDurationSeconds({ ...baseValues, hours: 2, minutes: null })).toBe(7200);
    expect(activityLogDurationSeconds({ ...baseValues, hours: null, minutes: null })).toBe(0);
  });
});

describe('activityLogDistanceMeters', () => {
  test('converts kilometres to whole metres', () => {
    expect(activityLogDistanceMeters(baseValues)).toBe(10000);
    expect(activityLogDistanceMeters({ ...baseValues, distanceKilometers: 5.23 })).toBe(5230);
    expect(activityLogDistanceMeters({ ...baseValues, distanceKilometers: null })).toBeNull();
  });
});

describe('validateActivityLogForm', () => {
  test('accepts a duration above zero with every other metric blank', () => {
    expect(validateActivityLogForm({ ...baseValues, distanceKilometers: null })).toEqual({});
  });

  test('requires a duration above zero', () => {
    expect(validateActivityLogForm({ ...baseValues, hours: 0, minutes: 0 }).duration).toBeDefined();
    expect(validateActivityLogForm({ ...baseValues, hours: null, minutes: null }).duration).toBeDefined();
  });
});
