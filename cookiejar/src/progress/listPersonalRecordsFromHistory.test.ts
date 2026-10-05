import { describe, expect, test } from 'bun:test';

import {
  detectPersonalRecords,
  selectBestRecordPerExercise,
  type CompletedSet,
} from '@/progress/detectPersonalRecords';
import { listPersonalRecordsFromHistory, type HistorySession } from '@/progress/listPersonalRecordsFromHistory';

function weightedSet(exerciseId: number, weightKilograms: number, repetitions: number): CompletedSet {
  return {
    exerciseId,
    trackingType: 'repetitions_and_weight',
    repetitions,
    weightKilograms,
    durationSeconds: null,
    distanceMeters: null,
  };
}

function durationSet(exerciseId: number, durationSeconds: number): CompletedSet {
  return {
    exerciseId,
    trackingType: 'duration',
    repetitions: null,
    weightKilograms: null,
    durationSeconds,
    distanceMeters: null,
  };
}

function session(sessionId: number, startedAt: string, sets: CompletedSet[]): HistorySession {
  return { sessionId, startedAt, sets };
}

describe('listPersonalRecordsFromHistory', () => {
  test('returns nothing without sessions', () => {
    expect(listPersonalRecordsFromHistory([])).toEqual([]);
  });

  test('gives nothing for the first session of an exercise', () => {
    const sessions = [session(1, '2026-01-01T09:00:00.000Z', [weightedSet(1, 100, 5)])];
    expect(listPersonalRecordsFromHistory(sessions)).toEqual([]);
  });

  test('lists records newest first with their session', () => {
    const sessions = [
      session(1, '2026-01-01T09:00:00.000Z', [weightedSet(1, 60, 5)]),
      session(2, '2026-01-08T09:00:00.000Z', [weightedSet(1, 70, 5)]),
      session(3, '2026-01-15T09:00:00.000Z', [weightedSet(1, 80, 5)]),
    ];
    const events = listPersonalRecordsFromHistory(sessions);
    expect(events.map((event) => event.sessionId)).toEqual([3, 2]);
    expect(events[0].startedAt).toBe('2026-01-15T09:00:00.000Z');
    expect(events[0].record.recordType).toBe('heaviestWeight');
    expect(events[0].record.set.weightKilograms).toBe(80);
  });

  test('keeps only the best record per exercise in a session', () => {
    const sessions = [
      session(1, '2026-01-01T09:00:00.000Z', [weightedSet(1, 60, 5)]),
      session(2, '2026-01-08T09:00:00.000Z', [weightedSet(1, 70, 8)]),
    ];
    const events = listPersonalRecordsFromHistory(sessions);
    expect(events).toHaveLength(1);
    expect(events[0].record.recordType).toBe('heaviestWeight');
  });

  test('does not let sessions that started at the same instant count as earlier for each other', () => {
    const sessions = [
      session(1, '2026-01-01T09:00:00.000Z', [weightedSet(1, 60, 5)]),
      session(2, '2026-01-08T09:00:00.000Z', [weightedSet(1, 70, 5)]),
      session(3, '2026-01-08T09:00:00.000Z', [weightedSet(1, 80, 5)]),
    ];
    const events = listPersonalRecordsFromHistory(sessions);
    expect(events.map((event) => event.sessionId).sort()).toEqual([2, 3]);
    expect(events.find((event) => event.sessionId === 3)?.record.set.weightKilograms).toBe(80);
  });

  test('matches detectPersonalRecords with selectBestRecordPerExercise for every session', () => {
    const sessions = [
      session(1, '2026-01-01T09:00:00.000Z', [weightedSet(1, 60, 5), durationSet(2, 30)]),
      session(2, '2026-01-03T09:00:00.000Z', [weightedSet(1, 62.5, 5), weightedSet(1, 60, 9), durationSet(2, 25)]),
      session(3, '2026-01-03T09:00:00.000Z', [weightedSet(1, 65, 3), durationSet(2, 40)]),
      session(4, '2026-01-10T09:00:00.000Z', [weightedSet(1, 55, 12), weightedSet(3, 20, 10)]),
      session(5, '2026-01-12T09:00:00.000Z', [weightedSet(1, 65, 4), weightedSet(3, 25, 10), durationSet(2, 41)]),
      session(6, '2026-01-20T09:00:00.000Z', []),
      session(7, '2026-01-21T09:00:00.000Z', [weightedSet(3, 25, 12), durationSet(2, 41)]),
    ];
    const expected = sessions.flatMap((current) => {
      const earlierSets = sessions
        .filter((candidate) => candidate.startedAt < current.startedAt)
        .flatMap((candidate) => candidate.sets);
      return selectBestRecordPerExercise(detectPersonalRecords(current.sets, earlierSets)).map((record) => ({
        sessionId: current.sessionId,
        startedAt: current.startedAt,
        record,
      }));
    });
    const actual = listPersonalRecordsFromHistory(sessions);
    const sortKey = (event: { sessionId: number; record: { exerciseId: number } }) =>
      event.sessionId * 1000 + event.record.exerciseId;
    expect([...actual].sort((a, b) => sortKey(a) - sortKey(b))).toEqual(
      [...expected].sort((a, b) => sortKey(a) - sortKey(b)),
    );
    expect(expected.length).toBeGreaterThan(4);
  });
});
