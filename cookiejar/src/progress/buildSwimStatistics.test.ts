import { describe, expect, test } from 'bun:test';

import { buildSwimStatistics } from '@/progress/buildSwimStatistics';
import type { SwimLog } from '@/types/SwimLog';

const now = new Date(2026, 9, 15, 12, 0, 0);

function buildLog(overrides: Partial<SwimLog> = {}): SwimLog {
  return {
    startedAt: new Date(2026, 9, 10, 8, 0, 0).toISOString(),
    durationSeconds: 1800,
    distanceMeters: 1000,
    strokeDistances: [{ strokeName: 'Freestyle', distanceMeters: 1000 }],
    ...overrides,
  };
}

describe('buildSwimStatistics', () => {
  test('is null without swims', () => {
    expect(buildSwimStatistics([], now)).toBeNull();
  });

  test('splits this month from all time at the month boundaries', () => {
    const statistics = buildSwimStatistics(
      [
        buildLog({ startedAt: new Date(2026, 8, 30, 23, 59, 59).toISOString(), distanceMeters: 500 }),
        buildLog({ startedAt: new Date(2026, 9, 1, 0, 0, 0).toISOString(), distanceMeters: 1000 }),
        buildLog({ startedAt: new Date(2026, 10, 1, 0, 0, 0).toISOString(), distanceMeters: 700 }),
      ],
      now,
    );
    expect(statistics?.thisMonth).toEqual({ swimCount: 1, distanceMeters: 1000 });
    expect(statistics?.allTime).toEqual({ swimCount: 3, distanceMeters: 2200 });
  });

  test('finds the longest swim and the fastest pace over at least 400 m', () => {
    const statistics = buildSwimStatistics(
      [
        buildLog({ distanceMeters: 1000, durationSeconds: 1800 }),
        buildLog({ distanceMeters: 2000, durationSeconds: 3000 }),
        buildLog({ distanceMeters: 300, durationSeconds: 60 }),
      ],
      now,
    );
    expect(statistics?.longestDistanceMeters).toBe(2000);
    expect(statistics?.fastestPaceSecondsPerHundredMeters).toBe(150);
  });

  test('has no pace or longest swim when nothing was swum', () => {
    const statistics = buildSwimStatistics([buildLog({ distanceMeters: 0, strokeDistances: [] })], now);
    expect(statistics?.longestDistanceMeters).toBeNull();
    expect(statistics?.fastestPaceSecondsPerHundredMeters).toBeNull();
    expect(statistics?.allTime.swimCount).toBe(1);
  });

  test('adds distance per stroke across swims, longest first', () => {
    const statistics = buildSwimStatistics(
      [
        buildLog({
          strokeDistances: [
            { strokeName: 'Freestyle', distanceMeters: 600 },
            { strokeName: 'Backstroke', distanceMeters: 400 },
          ],
        }),
        buildLog({
          strokeDistances: [
            { strokeName: 'Backstroke', distanceMeters: 500 },
            { strokeName: 'Breaststroke', distanceMeters: 100 },
          ],
        }),
      ],
      now,
    );
    expect(statistics?.strokeDistances).toEqual([
      { strokeName: 'Backstroke', distanceMeters: 900 },
      { strokeName: 'Freestyle', distanceMeters: 600 },
      { strokeName: 'Breaststroke', distanceMeters: 100 },
    ]);
  });
});
