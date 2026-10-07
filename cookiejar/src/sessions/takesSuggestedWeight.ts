type SuggestibleSet = {
  targetWeightKilograms: number | null;
};

export function takesSuggestedWeight(set: SuggestibleSet, sets: SuggestibleSet[]): boolean {
  const heaviestTargetWeight = Math.max(0, ...sets.map((siblingSet) => siblingSet.targetWeightKilograms ?? 0));
  return set.targetWeightKilograms === null || set.targetWeightKilograms === heaviestTargetWeight;
}
