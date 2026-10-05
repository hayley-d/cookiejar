import type { TrackingType } from '@/types/TrackingType';
import { trackedFields, type TargetSetValues } from '@/workouts/targetSetColumns';

export type SetValues = TargetSetValues;

export type FillableSet = SetValues & {
  targetRepetitions: number | null;
  targetWeightKilograms: number | null;
  targetDurationSeconds: number | null;
  targetDistanceMeters: number | null;
};

export type SetTickResult = { outcome: 'refused' } | { outcome: 'ticked'; values: SetValues };

export function actualValuesOf(set: FillableSet): SetValues {
  return {
    repetitions: set.repetitions,
    weightKilograms: set.weightKilograms,
    durationSeconds: set.durationSeconds,
    distanceMeters: set.distanceMeters,
  };
}

export function targetValuesOf(set: FillableSet): SetValues {
  return {
    repetitions: set.targetRepetitions,
    weightKilograms: set.targetWeightKilograms,
    durationSeconds: set.targetDurationSeconds,
    distanceMeters: set.targetDistanceMeters,
  };
}

export function fillSetForTick(trackingType: TrackingType, set: FillableSet): SetTickResult {
  const fields = trackedFields(trackingType);
  const targetValues = targetValuesOf(set);
  const filledValues = actualValuesOf(set);
  for (const field of fields) {
    if (filledValues[field] === null) {
      filledValues[field] = targetValues[field];
    }
  }
  const hasAnyTrackedValue = fields.some((field) => filledValues[field] !== null);
  return hasAnyTrackedValue ? { outcome: 'ticked', values: filledValues } : { outcome: 'refused' };
}

export type SetCompletionOutcome = 'ticked' | 'unticked' | 'refused';
