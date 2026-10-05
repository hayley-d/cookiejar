import type { TrackingType } from '@/types/TrackingType';

export type TargetSetValues = {
  repetitions: number | null;
  weightKilograms: number | null;
  durationSeconds: number | null;
  distanceMeters: number | null;
};

export type TargetSetField = keyof TargetSetValues;

export type TargetSetColumnInput = 'number' | 'duration';

export type TargetSetColumn = {
  field: TargetSetField;
  label: string;
  placeholder: string;
  input: TargetSetColumnInput;
  decimalPlaces: number;
};

const metersPerKilometer = 1000;

const repetitionsColumn: TargetSetColumn = {
  field: 'repetitions',
  label: 'Reps',
  placeholder: 'reps',
  input: 'number',
  decimalPlaces: 0,
};

const weightColumn: TargetSetColumn = {
  field: 'weightKilograms',
  label: 'Kg',
  placeholder: 'kg',
  input: 'number',
  decimalPlaces: 1,
};

const durationColumn: TargetSetColumn = {
  field: 'durationSeconds',
  label: 'Time',
  placeholder: '0:00',
  input: 'duration',
  decimalPlaces: 0,
};

const distanceColumn: TargetSetColumn = {
  field: 'distanceMeters',
  label: 'Distance',
  placeholder: 'km',
  input: 'number',
  decimalPlaces: 3,
};

const columnsByTrackingType: Record<TrackingType, TargetSetColumn[]> = {
  repetitions: [repetitionsColumn],
  repetitions_and_weight: [weightColumn, repetitionsColumn],
  duration: [durationColumn],
  distance: [distanceColumn],
};

export const emptyTargetSetValues: TargetSetValues = {
  repetitions: null,
  weightKilograms: null,
  durationSeconds: null,
  distanceMeters: null,
};

const allTargetSetFields: TargetSetField[] = ['repetitions', 'weightKilograms', 'durationSeconds', 'distanceMeters'];

export function targetSetColumns(trackingType: TrackingType): TargetSetColumn[] {
  return columnsByTrackingType[trackingType];
}

export function trackedFields(trackingType: TrackingType): TargetSetField[] {
  return targetSetColumns(trackingType).map((column) => column.field);
}

export function kilometersToMeters(kilometers: number) {
  return Math.round(kilometers * metersPerKilometer);
}

export function metersToKilometers(meters: number) {
  return Math.round(meters) / metersPerKilometer;
}

function roundToDecimalPlaces(value: number, decimalPlaces: number) {
  const scale = 10 ** decimalPlaces;
  return Math.round(value * scale) / scale;
}

export function columnInputValue(column: TargetSetColumn, targetSet: TargetSetValues): number | null {
  const storedValue = targetSet[column.field];
  if (storedValue === null) {
    return null;
  }
  return column.field === 'distanceMeters' ? metersToKilometers(storedValue) : storedValue;
}

export function targetSetChangeFromInput(
  column: TargetSetColumn,
  inputValue: number | null,
): Partial<TargetSetValues> {
  if (inputValue === null) {
    return { [column.field]: null };
  }
  if (column.field === 'distanceMeters') {
    return { distanceMeters: kilometersToMeters(inputValue) };
  }
  return { [column.field]: roundToDecimalPlaces(inputValue, column.decimalPlaces) };
}

export function clearUntrackedFields<TargetSet extends TargetSetValues>(
  targetSet: TargetSet,
  trackingType: TrackingType,
): TargetSet {
  const fieldsToKeep = trackedFields(trackingType);
  const clearedValues: Partial<TargetSetValues> = {};
  for (const field of allTargetSetFields) {
    if (!fieldsToKeep.includes(field)) {
      clearedValues[field] = null;
    }
  }
  return { ...targetSet, ...clearedValues };
}

export function trackingTypeChangeClearsValues(targetSets: TargetSetValues[], trackingType: TrackingType) {
  const fieldsToKeep = trackedFields(trackingType);
  return targetSets.some((targetSet) =>
    allTargetSetFields.some(
      (field) => !fieldsToKeep.includes(field) && targetSet[field] !== null,
    ),
  );
}
