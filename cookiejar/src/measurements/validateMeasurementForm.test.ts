import { describe, expect, test } from 'bun:test';

import {
  toBodyMeasurementInput,
  validateMeasurementForm,
  type MeasurementFormValues,
} from '@/measurements/validateMeasurementForm';

const today = '2026-10-05';

const validValues: MeasurementFormValues = {
  measuredOn: today,
  weightKilograms: 72.4,
  bodyFatPercent: null,
  waistCentimetres: null,
  hipCentimetres: null,
  chestCentimetres: null,
  notes: '',
};

describe('validateMeasurementForm', () => {
  test('accepts a weight alone', () => {
    expect(validateMeasurementForm(validValues, today)).toEqual({});
  });

  test('requires at least one value', () => {
    expect(validateMeasurementForm({ ...validValues, weightKilograms: null }, today).values).toBeDefined();
  });

  test('notes do not count as a value', () => {
    expect(
      validateMeasurementForm({ ...validValues, weightKilograms: null, notes: 'Felt good' }, today).values,
    ).toBeDefined();
  });

  test('a single non-weight value is enough', () => {
    expect(validateMeasurementForm({ ...validValues, weightKilograms: null, waistCentimetres: 80 }, today)).toEqual({});
  });

  test('rejects a date in the future and accepts today', () => {
    expect(validateMeasurementForm({ ...validValues, measuredOn: '2026-10-06' }, today).measuredOn).toBeDefined();
    expect(validateMeasurementForm({ ...validValues, measuredOn: today }, today).measuredOn).toBeUndefined();
  });

  test('weight is 20 to 400 kg with one decimal place', () => {
    expect(validateMeasurementForm({ ...validValues, weightKilograms: 20 }, today)).toEqual({});
    expect(validateMeasurementForm({ ...validValues, weightKilograms: 400 }, today)).toEqual({});
    expect(validateMeasurementForm({ ...validValues, weightKilograms: 19.9 }, today).weightKilograms).toBeDefined();
    expect(validateMeasurementForm({ ...validValues, weightKilograms: 400.1 }, today).weightKilograms).toBeDefined();
    expect(validateMeasurementForm({ ...validValues, weightKilograms: 72.45 }, today).weightKilograms).toBeDefined();
    expect(validateMeasurementForm({ ...validValues, weightKilograms: 0 }, today).weightKilograms).toBeDefined();
  });

  test('body fat is 2 to 75 percent', () => {
    expect(validateMeasurementForm({ ...validValues, bodyFatPercent: 2 }, today)).toEqual({});
    expect(validateMeasurementForm({ ...validValues, bodyFatPercent: 75 }, today)).toEqual({});
    expect(validateMeasurementForm({ ...validValues, bodyFatPercent: 1.9 }, today).bodyFatPercent).toBeDefined();
    expect(validateMeasurementForm({ ...validValues, bodyFatPercent: 75.1 }, today).bodyFatPercent).toBeDefined();
  });

  test('waist, hips and chest are 30 to 250 cm', () => {
    for (const field of ['waistCentimetres', 'hipCentimetres', 'chestCentimetres'] as const) {
      expect(validateMeasurementForm({ ...validValues, [field]: 30 }, today)).toEqual({});
      expect(validateMeasurementForm({ ...validValues, [field]: 250 }, today)).toEqual({});
      expect(validateMeasurementForm({ ...validValues, [field]: 29.9 }, today)[field]).toBeDefined();
      expect(validateMeasurementForm({ ...validValues, [field]: 250.1 }, today)[field]).toBeDefined();
    }
  });
});

describe('toBodyMeasurementInput', () => {
  test('trims notes and turns blank notes into null', () => {
    expect(toBodyMeasurementInput({ ...validValues, notes: '  After lunch  ' }).notes).toBe('After lunch');
    expect(toBodyMeasurementInput({ ...validValues, notes: '   ' }).notes).toBeNull();
  });

  test('carries the values across', () => {
    expect(toBodyMeasurementInput(validValues)).toEqual({
      measuredOn: today,
      weightKilograms: 72.4,
      bodyFatPercent: null,
      waistCentimetres: null,
      hipCentimetres: null,
      chestCentimetres: null,
      notes: null,
    });
  });
});
