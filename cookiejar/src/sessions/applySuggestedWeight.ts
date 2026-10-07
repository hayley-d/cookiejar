import type { LoadSuggestion } from '@/progress/suggestNextLoad';
import { takesSuggestedWeight } from '@/sessions/takesSuggestedWeight';
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
  return sets.map((set) =>
    takesSuggestedWeight(set, sets) ? { ...set, targetWeightKilograms: suggestion.weightKilograms } : set,
  );
}
