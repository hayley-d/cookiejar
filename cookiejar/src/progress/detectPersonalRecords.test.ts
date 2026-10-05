import { describe, expect, test } from 'bun:test';

import {
  countExercisesWithRecords,
  detectPersonalRecords,
  selectBestRecordPerExercise,
  type CompletedSet,
} from '@/progress/detectPersonalRecords';

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

function repetitionSet(exerciseId: number, repetitions: number): CompletedSet {
  return {
    exerciseId,
    trackingType: 'repetitions',
    repetitions,
    weightKilograms: null,
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

function distanceSet(exerciseId: number, distanceMeters: number): CompletedSet {
  return {
    exerciseId,
    trackingType: 'distance',
    repetitions: null,
    weightKilograms: null,
    durationSeconds: null,
    distanceMeters,
  };
}

function recordTypes(records: ReturnType<typeof detectPersonalRecords>) {
  return records.map((record) => record.recordType);
}

describe('weighted records', () => {
  test('a heavier weight is a heaviest weight record', () => {
    const records = detectPersonalRecords([weightedSet(1, 62.5, 8)], [weightedSet(1, 60, 8)]);
    expect(recordTypes(records)).toContain('heaviestWeight');
    expect(records.find((record) => record.recordType === 'heaviestWeight')?.set.weightKilograms).toBe(62.5);
  });

  test('a set with zero reps does not count as heaviest weight', () => {
    const records = detectPersonalRecords([weightedSet(1, 100, 0)], [weightedSet(1, 60, 8)]);
    expect(records).toEqual([]);
  });

  test('a better Epley estimate with the same weight is an estimated one-rep max record', () => {
    const records = detectPersonalRecords([weightedSet(1, 60, 10)], [weightedSet(1, 60, 8)]);
    expect(recordTypes(records)).toEqual(['bestEstimatedOneRepMax', 'mostRepetitionsAtWeight']);
  });

  test('sets above twelve reps do not produce an estimate record', () => {
    const records = detectPersonalRecords([weightedSet(1, 50, 20)], [weightedSet(1, 60, 8)]);
    expect(recordTypes(records)).toEqual(['mostRepetitionsAtWeight']);
  });

  test('more reps at a lighter weight than an earlier heavier set is not a record at weight', () => {
    const records = detectPersonalRecords([weightedSet(1, 50, 9)], [weightedSet(1, 60, 10)]);
    expect(recordTypes(records)).not.toContain('mostRepetitionsAtWeight');
  });

  test('more reps than a heavier earlier set is a record at weight', () => {
    const records = detectPersonalRecords([weightedSet(1, 50, 11)], [weightedSet(1, 60, 10)]);
    expect(recordTypes(records)).toContain('mostRepetitionsAtWeight');
  });

  test('the same weight and reps as before is not a record', () => {
    expect(detectPersonalRecords([weightedSet(1, 60, 8)], [weightedSet(1, 60, 8)])).toEqual([]);
  });

  test('a lighter weight is not a record', () => {
    expect(detectPersonalRecords([weightedSet(1, 40, 5)], [weightedSet(1, 60, 8)])).toEqual([]);
  });

  test('twelve reps still produce an estimate record', () => {
    const records = detectPersonalRecords([weightedSet(1, 50, 12)], [weightedSet(1, 50, 10)]);
    expect(recordTypes(records)).toContain('bestEstimatedOneRepMax');
  });

  test('thirteen reps do not produce an estimate record', () => {
    const records = detectPersonalRecords([weightedSet(1, 50, 13)], [weightedSet(1, 50, 10)]);
    expect(recordTypes(records)).toEqual(['mostRepetitionsAtWeight']);
  });

  test('a zero kilogram set ties on the estimate and only counts for reps at weight', () => {
    const records = detectPersonalRecords([weightedSet(1, 0, 8)], [weightedSet(1, 0, 5)]);
    expect(recordTypes(records)).toEqual(['mostRepetitionsAtWeight']);
  });

  test('a weighted set with null values is never a record', () => {
    const missingWeight = { ...weightedSet(1, 0, 10), weightKilograms: null };
    const missingRepetitions = { ...weightedSet(1, 100, 0), repetitions: null };
    expect(detectPersonalRecords([missingWeight, missingRepetitions], [weightedSet(1, 60, 8)])).toEqual([]);
  });

  test('no estimate record when every earlier set is above twelve reps', () => {
    const records = detectPersonalRecords([weightedSet(1, 60, 5)], [weightedSet(1, 60, 13)]);
    expect(recordTypes(records)).not.toContain('bestEstimatedOneRepMax');
  });

  test('an equal estimate from a different weight and reps is not a record', () => {
    const records = detectPersonalRecords([weightedSet(1, 20, 5)], [weightedSet(1, 17.5, 10)]);
    expect(recordTypes(records)).toEqual(['heaviestWeight']);
  });
});

describe('single value records', () => {
  test('most repetitions', () => {
    const records = detectPersonalRecords([repetitionSet(1, 21)], [repetitionSet(1, 20)]);
    expect(recordTypes(records)).toEqual(['mostRepetitions']);
  });

  test('longest duration', () => {
    const records = detectPersonalRecords([durationSet(1, 90)], [durationSet(1, 60)]);
    expect(recordTypes(records)).toEqual(['longestDuration']);
  });

  test('longest distance', () => {
    const records = detectPersonalRecords([distanceSet(1, 5200)], [distanceSet(1, 5000)]);
    expect(recordTypes(records)).toEqual(['longestDistance']);
  });

  test('ties are not records', () => {
    expect(detectPersonalRecords([repetitionSet(1, 20)], [repetitionSet(1, 20)])).toEqual([]);
    expect(detectPersonalRecords([durationSet(1, 60)], [durationSet(1, 60)])).toEqual([]);
    expect(detectPersonalRecords([distanceSet(1, 5000)], [distanceSet(1, 5000)])).toEqual([]);
  });
});

describe('rules across sets and exercises', () => {
  test('an exercise with no earlier sets is never a record', () => {
    expect(detectPersonalRecords([weightedSet(1, 200, 20)], [])).toEqual([]);
    expect(detectPersonalRecords([weightedSet(1, 200, 20)], [weightedSet(2, 10, 1)])).toEqual([]);
  });

  test('sets in the same session do not beat each other', () => {
    const records = detectPersonalRecords(
      [repetitionSet(1, 10), repetitionSet(1, 15), repetitionSet(1, 12)],
      [repetitionSet(1, 15)],
    );
    expect(records).toEqual([]);
  });

  test('only the best qualifying set is reported for each record type', () => {
    const records = detectPersonalRecords(
      [repetitionSet(1, 21), repetitionSet(1, 25), repetitionSet(1, 22)],
      [repetitionSet(1, 20)],
    );
    expect(records).toHaveLength(1);
    expect(records[0]?.set.repetitions).toBe(25);
  });

  test('a superset session reports records per exercise', () => {
    const records = detectPersonalRecords(
      [weightedSet(1, 70, 5), weightedSet(2, 20, 12), weightedSet(1, 72.5, 3), weightedSet(2, 20, 10)],
      [weightedSet(1, 70, 5), weightedSet(2, 22.5, 12)],
    );
    expect(new Set(records.map((record) => record.exerciseId))).toEqual(new Set([1]));
    expect(countExercisesWithRecords(records)).toBe(1);
  });

  test('records for two exercises are counted per exercise', () => {
    const records = detectPersonalRecords(
      [weightedSet(1, 80, 5), weightedSet(2, 30, 5)],
      [weightedSet(1, 70, 5), weightedSet(2, 20, 5)],
    );
    expect(countExercisesWithRecords(records)).toBe(2);
  });

  test('earlier sets of another tracking type do not set the bar', () => {
    expect(detectPersonalRecords([durationSet(1, 60)], [repetitionSet(1, 5)])).toEqual([]);
  });
});

describe('selectBestRecordPerExercise', () => {
  test('picks the highest priority record for each exercise', () => {
    const records = detectPersonalRecords(
      [weightedSet(1, 62.5, 8), repetitionSet(2, 30)],
      [weightedSet(1, 60, 8), repetitionSet(2, 20)],
    );
    const best = selectBestRecordPerExercise(records);
    expect(best.map((record) => [record.exerciseId, record.recordType])).toEqual([
      [1, 'heaviestWeight'],
      [2, 'mostRepetitions'],
    ]);
  });

  test('is empty without records', () => {
    expect(selectBestRecordPerExercise([])).toEqual([]);
  });
});
