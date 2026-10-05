import {
  maximumBodyFatPercent,
  maximumGirthCentimetres,
  maximumWeightKilograms,
  minimumBodyFatPercent,
  minimumGirthCentimetres,
  minimumWeightKilograms,
} from '@/measurements/measurementFormRules';
import type { BodyMeasurementInput } from '@/types/BodyMeasurement';

export type MeasurementFormValues = {
  measuredOn: string;
  weightKilograms: number | null;
  bodyFatPercent: number | null;
  waistCentimetres: number | null;
  hipCentimetres: number | null;
  chestCentimetres: number | null;
  notes: string;
};

export type MeasurementValueField =
  'weightKilograms' | 'bodyFatPercent' | 'waistCentimetres' | 'hipCentimetres' | 'chestCentimetres';

export type MeasurementFormErrors = Partial<Record<MeasurementValueField | 'measuredOn' | 'values', string>>;

const valueFields: MeasurementValueField[] = [
  'weightKilograms',
  'bodyFatPercent',
  'waistCentimetres',
  'hipCentimetres',
  'chestCentimetres',
];

function hasOneDecimalPlace(value: number) {
  return Math.round(value * 10) / 10 === value;
}

function isOutOfRange(value: number | null, minimum: number, maximum: number) {
  return (
    value !== null && (!Number.isFinite(value) || value < minimum || value > maximum || !hasOneDecimalPlace(value))
  );
}

export function validateMeasurementForm(values: MeasurementFormValues, today: string): MeasurementFormErrors {
  const errors: MeasurementFormErrors = {};

  if (values.measuredOn > today) {
    errors.measuredOn = 'Date cannot be in the future';
  }

  if (valueFields.every((field) => values[field] === null)) {
    errors.values = 'Enter at least one measurement';
  }

  if (isOutOfRange(values.weightKilograms, minimumWeightKilograms, maximumWeightKilograms)) {
    errors.weightKilograms = `Weight must be between ${minimumWeightKilograms} and ${maximumWeightKilograms} kg, with one decimal place`;
  }

  if (isOutOfRange(values.bodyFatPercent, minimumBodyFatPercent, maximumBodyFatPercent)) {
    errors.bodyFatPercent = `Body fat must be between ${minimumBodyFatPercent} and ${maximumBodyFatPercent} %, with one decimal place`;
  }

  const girthMessage = (label: string) =>
    `${label} must be between ${minimumGirthCentimetres} and ${maximumGirthCentimetres} cm, with one decimal place`;

  if (isOutOfRange(values.waistCentimetres, minimumGirthCentimetres, maximumGirthCentimetres)) {
    errors.waistCentimetres = girthMessage('Waist');
  }
  if (isOutOfRange(values.hipCentimetres, minimumGirthCentimetres, maximumGirthCentimetres)) {
    errors.hipCentimetres = girthMessage('Hips');
  }
  if (isOutOfRange(values.chestCentimetres, minimumGirthCentimetres, maximumGirthCentimetres)) {
    errors.chestCentimetres = girthMessage('Chest');
  }

  return errors;
}

export function toBodyMeasurementInput(values: MeasurementFormValues): BodyMeasurementInput {
  const trimmedNotes = values.notes.trim();
  return {
    measuredOn: values.measuredOn,
    weightKilograms: values.weightKilograms,
    bodyFatPercent: values.bodyFatPercent,
    waistCentimetres: values.waistCentimetres,
    hipCentimetres: values.hipCentimetres,
    chestCentimetres: values.chestCentimetres,
    notes: trimmedNotes.length === 0 ? null : trimmedNotes,
  };
}
