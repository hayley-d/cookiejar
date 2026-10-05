import { describe, expect, test } from 'bun:test';

import { buildPersonalRecordList, countPersonalRecordsInRange } from '@/progress/buildPersonalRecordList';
import type { FinishedSessionSet } from '@/types/FinishedSessionSet';

function row(sessionId: number, startedAt: string, weightKilograms: number): FinishedSessionSet {
  return {
    sessionId,
    startedAt,
    workoutName: `Workout ${sessionId}`,
    exerciseName: 'Squat',
    exerciseImageUrl: 'https://example.com/squat.png',
    set: {
      exerciseId: 1,
      trackingType: 'repetitions_and_weight',
      repetitions: 5,
      weightKilograms,
      durationSeconds: null,
      distanceMeters: null,
    },
  };
}

const rows = [
  row(1, '2026-09-10T12:00:00.000Z', 60),
  row(1, '2026-09-10T12:00:00.000Z', 62),
  row(2, '2026-09-20T12:00:00.000Z', 70),
  row(3, '2026-10-02T12:00:00.000Z', 80),
];

describe('buildPersonalRecordList', () => {
  test('groups sets by session and describes each record newest first', () => {
    const items = buildPersonalRecordList(rows);
    expect(items.map((item) => item.sessionId)).toEqual([3, 2]);
    expect(items[0]).toMatchObject({
      workoutName: 'Workout 3',
      exerciseName: 'Squat',
      exerciseImageUrl: 'https://example.com/squat.png',
      key: '3-1',
    });
  });

  test('counts the records inside a date range', () => {
    const items = buildPersonalRecordList(rows);
    expect(countPersonalRecordsInRange(items, { startDate: '2026-10-01', endDate: '2026-10-31' })).toBe(1);
    expect(countPersonalRecordsInRange(items, { startDate: null, endDate: '2026-10-31' })).toBe(2);
  });
});
