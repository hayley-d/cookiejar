import { describe, expect, test } from 'bun:test';

import { describeBodyMeasurement } from '@/measurements/describeBodyMeasurement';
import type { BodyMeasurement } from '@/types/BodyMeasurement';

const emptyMeasurement: BodyMeasurement = {
  id: 1,
  measuredOn: '2026-10-05',
  weightKilograms: null,
  bodyFatPercent: null,
  waistCentimetres: null,
  hipCentimetres: null,
  chestCentimetres: null,
  notes: null,
};

describe('describeBodyMeasurement', () => {
  test('leads with the weight and lists the other values', () => {
    expect(
      describeBodyMeasurement({
        ...emptyMeasurement,
        weightKilograms: 72.4,
        bodyFatPercent: 18,
        waistCentimetres: 80,
        notes: 'Morning',
      }),
    ).toEqual({ title: '72.4 kg', detail: '18 % body fat · waist 80 cm · Morning' });
  });

  test('has no detail for a weight alone', () => {
    expect(describeBodyMeasurement({ ...emptyMeasurement, weightKilograms: 72 })).toEqual({
      title: '72 kg',
      detail: null,
    });
  });

  test('leads with the first other value when there is no weight', () => {
    expect(describeBodyMeasurement({ ...emptyMeasurement, hipCentimetres: 95, chestCentimetres: 100 })).toEqual({
      title: 'hips 95 cm',
      detail: 'chest 100 cm',
    });
  });
});
