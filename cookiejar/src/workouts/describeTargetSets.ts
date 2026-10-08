import { formatDuration } from '@/dates/formatDuration';
import type { TrackingType } from '@/types/TrackingType';
import { metersToKilometers, type TargetSetField, type TargetSetValues } from '@/workouts/targetSetColumns';

const metersPerKilometer = 1000;
const missingValueText = '—';

export function formatWeight(weightKilograms: number): string {
  return String(weightKilograms);
}

export function formatDistance(distanceMeters: number): string {
  if (distanceMeters >= metersPerKilometer) {
    return `${metersToKilometers(distanceMeters)} km`;
  }
  return `${distanceMeters} m`;
}

export function formatTargetSetValue(field: TargetSetField, targetSet: TargetSetValues): string {
  const value = targetSet[field];
  if (value === null) {
    return missingValueText;
  }
  switch (field) {
    case 'weightKilograms':
      return formatWeight(value);
    case 'durationSeconds':
      return formatDuration(value);
    case 'distanceMeters':
      return formatDistance(value);
    default:
      return String(value);
  }
}

const primaryFieldByTrackingType: Record<TrackingType, TargetSetField> = {
  repetitions: 'repetitions',
  repetitions_and_weight: 'repetitions',
  repetitions_and_assistance: 'repetitions',
  duration: 'durationSeconds',
  distance: 'distanceMeters',
};

const weightUnitTextByTrackingType: Partial<Record<TrackingType, string>> = {
  repetitions_and_weight: 'kg',
  repetitions_and_assistance: 'kg assist',
};

function countSets(setCount: number): string {
  return `${setCount} ${setCount === 1 ? 'set' : 'sets'}`;
}

function describeWeight(targetSets: TargetSetValues[], weightUnitText: string): string {
  const weights = targetSets.flatMap((targetSet) =>
    targetSet.weightKilograms === null ? [] : [targetSet.weightKilograms],
  );
  if (weights.length === 0) {
    return '';
  }
  const lightest = Math.min(...weights);
  const heaviest = Math.max(...weights);
  const weightText = lightest === heaviest ? formatWeight(lightest) : `${formatWeight(lightest)}–${formatWeight(heaviest)}`;
  return ` @ ${weightText} ${weightUnitText}`;
}

export function describeTargetSets(trackingType: TrackingType, targetSets: TargetSetValues[]): string {
  if (targetSets.length === 0) {
    return 'No sets';
  }
  const primaryField = primaryFieldByTrackingType[trackingType];
  if (targetSets.some((targetSet) => targetSet[primaryField] === null)) {
    return countSets(targetSets.length);
  }

  const weightUnitText = weightUnitTextByTrackingType[trackingType];
  const hasWeight = weightUnitText !== undefined;
  const weightSuffix = hasWeight ? describeWeight(targetSets, weightUnitText) : '';
  const firstTargetSet = targetSets[0] as TargetSetValues;
  const isUniform = targetSets.every(
    (targetSet) =>
      targetSet[primaryField] === firstTargetSet[primaryField] &&
      (!hasWeight || targetSet.weightKilograms === firstTargetSet.weightKilograms),
  );

  if (isUniform) {
    return `${targetSets.length} × ${formatTargetSetValue(primaryField, firstTargetSet)}${weightSuffix}`;
  }
  const primaryValues = targetSets.map((targetSet) => formatTargetSetValue(primaryField, targetSet));
  return `${primaryValues.join(' / ')}${weightSuffix}`;
}
