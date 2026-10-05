import { describe, expect, test } from 'bun:test';

import { describePersonalRecordDetail } from '@/progress/describePersonalRecord';
import type { PersonalRecord, PersonalRecordType } from '@/progress/detectPersonalRecords';

function recordOf(recordType: PersonalRecordType, values: Partial<PersonalRecord['set']>): PersonalRecord {
  return {
    exerciseId: 1,
    recordType,
    set: {
      exerciseId: 1,
      trackingType: 'repetitions_and_weight',
      repetitions: null,
      weightKilograms: null,
      durationSeconds: null,
      distanceMeters: null,
      ...values,
    },
  };
}

describe('describePersonalRecordDetail', () => {
  test('weighted records show the set and a whole-kilogram estimated one-rep max', () => {
    expect(describePersonalRecordDetail(recordOf('heaviestWeight', { weightKilograms: 62.5, repetitions: 8 }))).toBe(
      '62.5 kg × 8 (est. 1RM 79 kg)',
    );
  });

  test('weighted records above twelve reps show no estimated one-rep max', () => {
    const thirteenRepetitions = recordOf('mostRepetitionsAtWeight', { weightKilograms: 50, repetitions: 13 });
    const twelveRepetitions = recordOf('mostRepetitionsAtWeight', { weightKilograms: 50, repetitions: 12 });
    expect(describePersonalRecordDetail(thirteenRepetitions)).toBe('50 kg × 13');
    expect(describePersonalRecordDetail(twelveRepetitions)).toBe('50 kg × 12 (est. 1RM 70 kg)');
  });

  test('repetitions', () => {
    expect(describePersonalRecordDetail(recordOf('mostRepetitions', { repetitions: 21 }))).toBe('21 reps');
    expect(describePersonalRecordDetail(recordOf('mostRepetitions', { repetitions: 1 }))).toBe('1 rep');
  });

  test('duration', () => {
    expect(describePersonalRecordDetail(recordOf('longestDuration', { durationSeconds: 95 }))).toBe('1m 35s');
  });

  test('distance', () => {
    expect(describePersonalRecordDetail(recordOf('longestDistance', { distanceMeters: 5200 }))).toBe('5.2 km');
  });
});
