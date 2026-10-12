import { describe, expect, test } from 'bun:test';

import { buildActivityStatistics } from '@/progress/buildActivityStatistics';
import type { ActivityLog } from '@/types/ActivityLog';

const now = new Date(2026, 9, 15, 12, 0);

function buildLog(overrides: Partial<ActivityLog> = {}): ActivityLog {
  return {
    activityType: 'hike',
    startedAt: new Date(2026, 9, 3, 8, 0).toISOString(),
    durationSeconds: 3600,
    distanceMeters: 5000,
    elevationGainMeters: 200,
    ...overrides,
  };
}

describe('buildActivityStatistics', () => {
  test('returns nothing without logs', () => {
    expect(buildActivityStatistics([], now)).toEqual([]);
  });

  test('returns one entry per type that has logs, in type order', () => {
    const statistics = buildActivityStatistics(
      [buildLog({ activityType: 'walk' }), buildLog({ activityType: 'hike' })],
      now,
    );
    expect(statistics.map((entry) => entry.activityType)).toEqual(['hike', 'walk']);
  });

  test('totals this month and all time separately', () => {
    const [hikeStatistics] = buildActivityStatistics(
      [
        buildLog(),
        buildLog({ distanceMeters: 3000, elevationGainMeters: 50 }),
        buildLog({
          startedAt: new Date(2026, 8, 20, 8, 0).toISOString(),
          distanceMeters: 10000,
          elevationGainMeters: 700,
        }),
      ],
      now,
    );
    expect(hikeStatistics.thisMonth).toEqual({ sessionCount: 2, distanceMeters: 8000, elevationGainMeters: 250 });
    expect(hikeStatistics.allTime).toEqual({ sessionCount: 3, distanceMeters: 18000, elevationGainMeters: 950 });
  });

  test('treats missing distance and elevation as zero in totals', () => {
    const [hikeStatistics] = buildActivityStatistics(
      [buildLog({ distanceMeters: null, elevationGainMeters: null })],
      now,
    );
    expect(hikeStatistics.allTime).toEqual({ sessionCount: 1, distanceMeters: 0, elevationGainMeters: 0 });
  });

  test('finds the longest distance, most elevation and fastest pace', () => {
    const [hikeStatistics] = buildActivityStatistics(
      [
        buildLog({ distanceMeters: 5000, elevationGainMeters: 900, durationSeconds: 3000 }),
        buildLog({ distanceMeters: 12000, elevationGainMeters: 100, durationSeconds: 14400 }),
      ],
      now,
    );
    expect(hikeStatistics.bests).toEqual({
      longestDistanceMeters: 12000,
      mostElevationGainMeters: 900,
      fastestPaceSecondsPerKilometer: 600,
    });
  });

  test('ignores logs under one kilometre for the fastest pace', () => {
    const [runStatistics] = buildActivityStatistics(
      [
        buildLog({ activityType: 'run', distanceMeters: 500, durationSeconds: 60 }),
        buildLog({ activityType: 'run', distanceMeters: 1000, durationSeconds: 400 }),
      ],
      now,
    );
    expect(runStatistics.bests.fastestPaceSecondsPerKilometer).toBe(400);
  });

  test('has no bests without the relevant metrics', () => {
    const [hikeStatistics] = buildActivityStatistics(
      [buildLog({ distanceMeters: null, elevationGainMeters: null })],
      now,
    );
    expect(hikeStatistics.bests).toEqual({
      longestDistanceMeters: null,
      mostElevationGainMeters: null,
      fastestPaceSecondsPerKilometer: null,
    });
  });
});
