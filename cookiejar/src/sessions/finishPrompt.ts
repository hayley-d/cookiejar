type PromptSet = {
  completedAt: string | null;
};

export type FinishPrompt =
  | { kind: 'finish' }
  | { kind: 'confirmUnticked'; untickedSetCount: number }
  | { kind: 'offerDiscard' };

export function resolveFinishPrompt(exercises: readonly { sets: readonly PromptSet[] }[]): FinishPrompt {
  const sets = exercises.flatMap((exercise) => exercise.sets);
  const untickedSetCount = sets.filter((set) => set.completedAt === null).length;
  if (untickedSetCount === sets.length) {
    return { kind: 'offerDiscard' };
  }
  if (untickedSetCount > 0) {
    return { kind: 'confirmUnticked', untickedSetCount };
  }
  return { kind: 'finish' };
}

export function describeUntickedSets(untickedSetCount: number): string {
  const setWord = untickedSetCount === 1 ? 'set' : 'sets';
  return `${untickedSetCount} ${setWord} not completed — finish anyway?`;
}
