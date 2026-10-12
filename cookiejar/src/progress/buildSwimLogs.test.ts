import { describe, expect, test } from 'bun:test';

import { buildSwimLogs, type SwimTickedSetRow } from '@/progress/buildSwimLogs';

function buildRow(overrides: Partial<SwimTickedSetRow> = {}): SwimTickedSetRow {
  return {
    sessionId: 1,
    startedAt: '2026-10-01T08:00:00.000Z',
    durationSeconds: 1800,
    strokeName: 'Freestyle',
    setDistanceMeters: 100,
    tickedRepetitionCount: 4,
    ...overrides,
  };
}

describe('buildSwimLogs', () => {
  test('sums ticked repetitions per stroke for each session', () => {
    const logs = buildSwimLogs([
      buildRow(),
      buildRow({ strokeName: 'Backstroke', setDistanceMeters: 50, tickedRepetitionCount: 2 }),
      buildRow({ sessionId: 2, startedAt: '2026-10-02T08:00:00.000Z', tickedRepetitionCount: 1 }),
    ]);
    expect(logs).toEqual([
      {
        startedAt: '2026-10-01T08:00:00.000Z',
        durationSeconds: 1800,
        distanceMeters: 500,
        strokeDistances: [
          { strokeName: 'Freestyle', distanceMeters: 400 },
          { strokeName: 'Backstroke', distanceMeters: 100 },
        ],
      },
      {
        startedAt: '2026-10-02T08:00:00.000Z',
        durationSeconds: 1800,
        distanceMeters: 100,
        strokeDistances: [{ strokeName: 'Freestyle', distanceMeters: 100 }],
      },
    ]);
  });

  test('a session with no ticked repetitions swam nothing', () => {
    expect(buildSwimLogs([buildRow({ tickedRepetitionCount: 0 })])[0].distanceMeters).toBe(0);
  });

  test('a session with no sets still yields a log', () => {
    const logs = buildSwimLogs([buildRow({ strokeName: null, setDistanceMeters: null, tickedRepetitionCount: 0 })]);
    expect(logs).toHaveLength(1);
    expect(logs[0].strokeDistances).toEqual([]);
  });
});
