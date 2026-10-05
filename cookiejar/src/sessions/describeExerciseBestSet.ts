import { describePreviousSet } from '@/sessions/describePreviousSet';
import type { TrackingType } from '@/types/TrackingType';

type BestSetCandidate = {
  repetitions: number | null;
  weightKilograms: number | null;
  durationSeconds: number | null;
  distanceMeters: number | null;
  completedAt: string | null;
};

function rankOf(trackingType: TrackingType, set: BestSetCandidate): [number, number] {
  switch (trackingType) {
    case 'repetitions_and_weight':
      return [set.weightKilograms ?? 0, set.repetitions ?? 0];
    case 'repetitions':
      return [set.repetitions ?? 0, 0];
    case 'duration':
      return [set.durationSeconds ?? 0, 0];
    case 'distance':
      return [set.distanceMeters ?? 0, 0];
  }
}

export function describeExerciseBestSet(trackingType: TrackingType, sets: readonly BestSetCandidate[]): string | null {
  const completedSets = sets.filter((set) => set.completedAt !== null);
  let bestSet: BestSetCandidate | null = null;
  for (const set of completedSets) {
    if (bestSet === null) {
      bestSet = set;
      continue;
    }
    const [primary, secondary] = rankOf(trackingType, set);
    const [bestPrimary, bestSecondary] = rankOf(trackingType, bestSet);
    if (primary > bestPrimary || (primary === bestPrimary && secondary > bestSecondary)) {
      bestSet = set;
    }
  }
  if (bestSet === null) {
    return null;
  }
  const description = describePreviousSet(trackingType, bestSet);
  return description === '—' ? null : description;
}
