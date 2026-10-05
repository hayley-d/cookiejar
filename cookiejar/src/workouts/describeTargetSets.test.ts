import { describe, expect, test } from 'bun:test';

import { describeTargetSets, formatTargetSetValue } from '@/workouts/describeTargetSets';

type Values = {
  repetitions?: number | null;
  weightKilograms?: number | null;
  durationSeconds?: number | null;
  distanceMeters?: number | null;
};

function targetSet(values: Values) {
  return {
    repetitions: null,
    weightKilograms: null,
    durationSeconds: null,
    distanceMeters: null,
    ...values,
  };
}

describe('describeTargetSets uniform sets', () => {
  test('repetitions and weight', () => {
    const sets = Array.from({ length: 4 }, () => targetSet({ repetitions: 8, weightKilograms: 60 }));
    expect(describeTargetSets('repetitions_and_weight', sets)).toBe('4 × 8 @ 60 kg');
  });

  test('repetitions only', () => {
    const sets = Array.from({ length: 4 }, () => targetSet({ repetitions: 12 }));
    expect(describeTargetSets('repetitions', sets)).toBe('4 × 12');
  });

  test('repetitions and weight without a weight', () => {
    const sets = Array.from({ length: 3 }, () => targetSet({ repetitions: 10 }));
    expect(describeTargetSets('repetitions_and_weight', sets)).toBe('3 × 10');
  });

  test('decimal weight', () => {
    const sets = [targetSet({ repetitions: 5, weightKilograms: 62.5 })];
    expect(describeTargetSets('repetitions_and_weight', sets)).toBe('1 × 5 @ 62.5 kg');
  });

  test('duration', () => {
    const sets = Array.from({ length: 3 }, () => targetSet({ durationSeconds: 60 }));
    expect(describeTargetSets('duration', sets)).toBe('3 × 1m');
  });

  test('distance in meters', () => {
    const sets = Array.from({ length: 3 }, () => targetSet({ distanceMeters: 500 }));
    expect(describeTargetSets('distance', sets)).toBe('3 × 500 m');
  });

  test('distance in kilometers', () => {
    const sets = [targetSet({ distanceMeters: 5000 }), targetSet({ distanceMeters: 5000 })];
    expect(describeTargetSets('distance', sets)).toBe('2 × 5 km');
  });
});

describe('describeTargetSets varied sets', () => {
  test('varied repetitions with a weight range', () => {
    const sets = [
      targetSet({ repetitions: 12, weightKilograms: 40 }),
      targetSet({ repetitions: 10, weightKilograms: 45 }),
      targetSet({ repetitions: 8, weightKilograms: 50 }),
    ];
    expect(describeTargetSets('repetitions_and_weight', sets)).toBe('12 / 10 / 8 @ 40–50 kg');
  });

  test('varied repetitions with one shared weight', () => {
    const sets = [
      targetSet({ repetitions: 12, weightKilograms: 40 }),
      targetSet({ repetitions: 10, weightKilograms: 40 }),
    ];
    expect(describeTargetSets('repetitions_and_weight', sets)).toBe('12 / 10 @ 40 kg');
  });

  test('same repetitions with varied weight', () => {
    const sets = [
      targetSet({ repetitions: 8, weightKilograms: 40 }),
      targetSet({ repetitions: 8, weightKilograms: 50 }),
    ];
    expect(describeTargetSets('repetitions_and_weight', sets)).toBe('8 / 8 @ 40–50 kg');
  });

  test('varied repetitions only', () => {
    const sets = [targetSet({ repetitions: 12 }), targetSet({ repetitions: 10 })];
    expect(describeTargetSets('repetitions', sets)).toBe('12 / 10');
  });

  test('varied durations', () => {
    const sets = [targetSet({ durationSeconds: 60 }), targetSet({ durationSeconds: 45 })];
    expect(describeTargetSets('duration', sets)).toBe('1m / 45s');
  });

  test('varied distances', () => {
    const sets = [targetSet({ distanceMeters: 500 }), targetSet({ distanceMeters: 1000 })];
    expect(describeTargetSets('distance', sets)).toBe('500 m / 1 km');
  });
});

describe('describeTargetSets missing targets', () => {
  test('no targets filled in', () => {
    expect(describeTargetSets('repetitions_and_weight', [targetSet({}), targetSet({}), targetSet({})])).toBe('3 sets');
  });

  test('a single set without targets', () => {
    expect(describeTargetSets('duration', [targetSet({})])).toBe('1 set');
  });

  test('some sets missing the main target', () => {
    const sets = [targetSet({ repetitions: 10 }), targetSet({})];
    expect(describeTargetSets('repetitions', sets)).toBe('2 sets');
  });

  test('weight without repetitions', () => {
    const sets = [targetSet({ weightKilograms: 40 }), targetSet({ weightKilograms: 40 })];
    expect(describeTargetSets('repetitions_and_weight', sets)).toBe('2 sets');
  });

  test('weight present on only some sets', () => {
    const sets = [targetSet({ repetitions: 8, weightKilograms: 40 }), targetSet({ repetitions: 8 })];
    expect(describeTargetSets('repetitions_and_weight', sets)).toBe('8 / 8 @ 40 kg');
  });

  test('no sets', () => {
    expect(describeTargetSets('repetitions', [])).toBe('No sets');
  });

  test('values outside the tracking type are ignored', () => {
    const sets = [targetSet({ repetitions: 8, weightKilograms: 40 })];
    expect(describeTargetSets('duration', sets)).toBe('1 set');
    expect(describeTargetSets('repetitions', [targetSet({ repetitions: 8, weightKilograms: 40 })])).toBe('1 × 8');
  });
});

describe('formatTargetSetValue', () => {
  test('formats each field', () => {
    expect(formatTargetSetValue('repetitions', targetSet({ repetitions: 8 }))).toBe('8');
    expect(formatTargetSetValue('weightKilograms', targetSet({ weightKilograms: 62.5 }))).toBe('62.5');
    expect(formatTargetSetValue('durationSeconds', targetSet({ durationSeconds: 90 }))).toBe('1m 30s');
    expect(formatTargetSetValue('distanceMeters', targetSet({ distanceMeters: 2500 }))).toBe('2.5 km');
    expect(formatTargetSetValue('repetitions', targetSet({}))).toBe('—');
  });
});
