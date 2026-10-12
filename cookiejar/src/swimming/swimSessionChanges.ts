import type { SwimSessionRepetition, SwimSessionSection } from '@/swimming/swimSessionTypes';

function mapRepetitions(
  sections: SwimSessionSection[],
  change: (repetition: SwimSessionRepetition) => SwimSessionRepetition,
): SwimSessionSection[] {
  return sections.map((section) => ({
    ...section,
    blocks: section.blocks.map((block) => ({
      ...block,
      sets: block.sets.map((set) => ({ ...set, repetitionRows: set.repetitionRows.map(change) })),
    })),
  }));
}

export function findRepetitionCompletion(sections: SwimSessionSection[], repetitionId: number): string | null | undefined {
  for (const section of sections) {
    for (const block of section.blocks) {
      for (const set of block.sets) {
        const repetition = set.repetitionRows.find((candidate) => candidate.id === repetitionId);
        if (repetition !== undefined) {
          return repetition.completedAt;
        }
      }
    }
  }
  return undefined;
}

export function withRepetitionCompletion(
  sections: SwimSessionSection[],
  repetitionId: number,
  completedAt: string | null,
): SwimSessionSection[] {
  return mapRepetitions(sections, (repetition) =>
    repetition.id === repetitionId ? { ...repetition, completedAt } : repetition,
  );
}

export function withAllRepetitionsCompleted(sections: SwimSessionSection[], completedAt: string): SwimSessionSection[] {
  return mapRepetitions(sections, (repetition) =>
    repetition.completedAt === null ? { ...repetition, completedAt } : repetition,
  );
}
