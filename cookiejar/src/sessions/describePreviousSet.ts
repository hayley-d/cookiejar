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

export type PreviousSessionSet = TargetSetValues & {
  position: number;
};

export function matchPreviousSets(
  sets: readonly { position: number }[],
  previousSets: readonly PreviousSessionSet[],
): (TargetSetValues | null)[] {
  return sets.map((set) => previousSets.find((previousSet) => previousSet.position === set.position) ?? null);
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
