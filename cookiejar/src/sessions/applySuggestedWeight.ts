import type { LoadSuggestion } from '@/progress/suggestNextLoad';
import type { TrackingType } from '@/types/TrackingType';

type SuggestibleSet = {
  targetWeightKilograms: number | null;
};

export function applySuggestedWeight<Set extends SuggestibleSet>(
  trackingType: TrackingType,
  sets: Set[],
  suggestion: LoadSuggestion | null,
): Set[] {
  if (suggestion === null || trackingType !== 'repetitions_and_weight') {
    return sets;
  }
  const heaviestTargetWeight = Math.max(0, ...sets.map((set) => set.targetWeightKilograms ?? 0));
  return sets.map((set) => {
    const takesSuggestion = set.targetWeightKilograms === null || set.targetWeightKilograms === heaviestTargetWeight;
    return takesSuggestion ? { ...set, targetWeightKilograms: suggestion.weightKilograms } : set;
  });
}
