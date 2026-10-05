import { formatTargetSetValue } from '@/workouts/describeTargetSets';
import type { TrackingType } from '@/types/TrackingType';
import type { TargetSetField, TargetSetValues } from '@/workouts/targetSetColumns';

export const noPreviousSetText = '—';

const primaryFieldByTrackingType: Record<TrackingType, TargetSetField> = {
  repetitions: 'repetitions',
  repetitions_and_weight: 'repetitions',
  duration: 'durationSeconds',
  distance: 'distanceMeters',
};

export function matchPreviousSets(
  setCount: number,
  previousSets: readonly TargetSetValues[],
): (TargetSetValues | null)[] {
  return Array.from({ length: setCount }, (_, index) => previousSets[index] ?? null);
}

export function describePreviousSet(trackingType: TrackingType, previousSet: TargetSetValues | null): string {
  if (previousSet === null) {
    return noPreviousSetText;
  }
  const primaryField = primaryFieldByTrackingType[trackingType];
  if (previousSet[primaryField] === null) {
    return noPreviousSetText;
  }
  const primaryText = formatTargetSetValue(primaryField, previousSet);
  if (trackingType === 'repetitions_and_weight') {
    const weightText = formatTargetSetValue('weightKilograms', previousSet);
    return previousSet.weightKilograms === null ? primaryText : `${weightText} × ${primaryText}`;
  }
  return primaryText;
}
