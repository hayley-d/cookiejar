import { describe, expect, test } from 'bun:test';

import {
  clearUntrackedFields,
  columnInputValue,
  emptyTargetSetValues,
  kilometersToMeters,
  metersToKilometers,
  targetSetChangeFromInput,
  targetSetColumns,
  trackingTypeChangeClearsValues,
  type TargetSetValues,
} from '@/workouts/targetSetColumns';

function columnLabels(trackingType: Parameters<typeof targetSetColumns>[0]) {
  return targetSetColumns(trackingType).map((column) => column.label);
}

function onlyColumn(trackingType: Parameters<typeof targetSetColumns>[0]) {
  return targetSetColumns(trackingType)[0];
}

describe('targetSetColumns', () => {
  test('repetitions shows a whole-number Reps column', () => {
    expect(columnLabels('repetitions')).toEqual(['Reps']);
    expect(onlyColumn('repetitions')).toMatchObject({ field: 'repetitions', input: 'number', decimalPlaces: 0 });
  });

  test('repetitions and weight shows Kg with one decimal place, then Reps', () => {
    expect(columnLabels('repetitions_and_weight')).toEqual(['Kg', 'Reps']);
    expect(targetSetColumns('repetitions_and_weight')[0]).toMatchObject({
      field: 'weightKilograms',
      input: 'number',
      decimalPlaces: 1,
    });
  });

  test('duration shows a Time column parsed as a duration', () => {
    expect(columnLabels('duration')).toEqual(['Time']);
    expect(onlyColumn('duration')).toMatchObject({ field: 'durationSeconds', input: 'duration' });
  });

  test('distance shows a decimal Distance column typed in km', () => {
    expect(columnLabels('distance')).toEqual(['Distance']);
    expect(onlyColumn('distance')).toMatchObject({ field: 'distanceMeters', input: 'number', placeholder: 'km' });
  });
});

describe('kilometers and meters', () => {
  test('kilometers convert to whole meters', () => {
    expect(kilometersToMeters(1.5)).toBe(1500);
    expect(kilometersToMeters(0.0004)).toBe(0);
    expect(kilometersToMeters(5)).toBe(5000);
  });

  test('meters convert back to kilometers', () => {
    expect(metersToKilometers(1500)).toBe(1.5);
    expect(metersToKilometers(1234)).toBe(1.234);
  });

  test('the distance column shows km and stores meters', () => {
    const distanceColumn = onlyColumn('distance');
    expect(columnInputValue(distanceColumn, { ...emptyTargetSetValues, distanceMeters: 2500 })).toBe(2.5);
    expect(targetSetChangeFromInput(distanceColumn, 2.5)).toEqual({ distanceMeters: 2500 });
  });
});

describe('column input values', () => {
  test('an empty field shows no value', () => {
    expect(columnInputValue(onlyColumn('repetitions'), emptyTargetSetValues)).toBeNull();
  });

  test('clearing an input stores null in its field', () => {
    expect(targetSetChangeFromInput(onlyColumn('distance'), null)).toEqual({ distanceMeters: null });
    expect(targetSetChangeFromInput(onlyColumn('repetitions'), null)).toEqual({ repetitions: null });
  });

  test('kg is rounded to one decimal place and reps to a whole number', () => {
    const [weightColumn, repetitionsColumn] = targetSetColumns('repetitions_and_weight');
    expect(targetSetChangeFromInput(weightColumn, 62.55)).toEqual({ weightKilograms: 62.6 });
    expect(targetSetChangeFromInput(repetitionsColumn, 12)).toEqual({ repetitions: 12 });
  });

  test('a duration is stored in seconds as given', () => {
    expect(targetSetChangeFromInput(onlyColumn('duration'), 90)).toEqual({ durationSeconds: 90 });
  });
});

describe('changing the tracking type', () => {
  const weightedSet: TargetSetValues = { ...emptyTargetSetValues, weightKilograms: 60, repetitions: 10 };

  test('clears the fields the new type does not track and keeps the rest', () => {
    expect(clearUntrackedFields({ ...weightedSet, key: 'set-1' }, 'repetitions')).toEqual({
      key: 'set-1',
      repetitions: 10,
      weightKilograms: null,
      durationSeconds: null,
      distanceMeters: null,
    });
  });

  test('clears everything when nothing is shared', () => {
    expect(clearUntrackedFields(weightedSet, 'duration')).toEqual(emptyTargetSetValues);
  });

  test('only warns when a value would be cleared', () => {
    expect(trackingTypeChangeClearsValues([weightedSet], 'duration')).toBe(true);
    expect(trackingTypeChangeClearsValues([weightedSet], 'repetitions')).toBe(true);
    expect(trackingTypeChangeClearsValues([{ ...emptyTargetSetValues, repetitions: 10 }], 'repetitions_and_weight')).toBe(
      false,
    );
    expect(trackingTypeChangeClearsValues([emptyTargetSetValues, emptyTargetSetValues], 'distance')).toBe(false);
    expect(trackingTypeChangeClearsValues([], 'distance')).toBe(false);
  });
});
