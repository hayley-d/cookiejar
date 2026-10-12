export type SwimRepetitionRecord = {
  strokeName: string;
  distanceMeters: number;
  isCompleted: boolean;
};

export type SwimStrokeDistance = {
  strokeName: string;
  distanceMeters: number;
};

type RecordedRepetition = { completedAt: string | null };
type RecordedSet = {
  exerciseName: string;
  distanceMeters: number;
  repetitionRows: readonly RecordedRepetition[];
};
type RecordedBlock = { sets: readonly RecordedSet[] };
type RecordedSection = { blocks: readonly RecordedBlock[] };

export function flattenSwimRepetitions(sections: readonly RecordedSection[]): SwimRepetitionRecord[] {
  return sections.flatMap((section) =>
    section.blocks.flatMap((block) =>
      block.sets.flatMap((set) =>
        set.repetitionRows.map((repetitionRow) => ({
          strokeName: set.exerciseName,
          distanceMeters: set.distanceMeters,
          isCompleted: repetitionRow.completedAt !== null,
        })),
      ),
    ),
  );
}

export function swumDistance(repetitions: readonly SwimRepetitionRecord[]): number {
  return repetitions.reduce(
    (total, repetition) => (repetition.isCompleted ? total + repetition.distanceMeters : total),
    0,
  );
}

export function swumDistanceByStroke(repetitions: readonly SwimRepetitionRecord[]): SwimStrokeDistance[] {
  const distanceByStrokeName = new Map<string, number>();
  for (const repetition of repetitions) {
    if (repetition.isCompleted) {
      distanceByStrokeName.set(
        repetition.strokeName,
        (distanceByStrokeName.get(repetition.strokeName) ?? 0) + repetition.distanceMeters,
      );
    }
  }
  return [...distanceByStrokeName.entries()]
    .map(([strokeName, distanceMeters]) => ({ strokeName, distanceMeters }))
    .sort((first, second) => second.distanceMeters - first.distanceMeters);
}

export function countOpenRepetitions(repetitions: readonly SwimRepetitionRecord[]): number {
  return repetitions.filter((repetition) => !repetition.isCompleted).length;
}
