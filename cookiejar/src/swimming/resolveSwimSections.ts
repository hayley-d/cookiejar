import type { DefaultSwimWorkout } from '@/swimming/defaultSwimWorkouts';
import type { SwimSection } from '@/swimming/swimTypes';

export type ExerciseNameRow = {
  id: number;
  name: string;
};

export class UnresolvedSwimStrokeError extends Error {
  readonly strokeName: string;

  constructor(strokeName: string) {
    super(`Default swim exercise "${strokeName}" is not seeded`);
    this.name = 'UnresolvedSwimStrokeError';
    this.strokeName = strokeName;
  }
}

function normalizeExerciseName(name: string): string {
  return name.trim().toLowerCase();
}

export function buildExerciseIdLookup(exerciseRows: ExerciseNameRow[]): Map<string, number> {
  const exerciseIdByNormalizedName = new Map<string, number>();
  for (const row of exerciseRows) {
    const normalizedName = normalizeExerciseName(row.name);
    if (!exerciseIdByNormalizedName.has(normalizedName)) {
      exerciseIdByNormalizedName.set(normalizedName, row.id);
    }
  }
  return exerciseIdByNormalizedName;
}

export function resolveSwimSections(
  workout: DefaultSwimWorkout,
  exerciseIdByNormalizedName: Map<string, number>,
): SwimSection[] {
  return workout.sections.map((section) => ({
    name: section.name,
    blocks: section.blocks.map((block) => ({
      rounds: block.rounds,
      restAfterSeconds: block.restAfterSeconds,
      sets: block.sets.map((set) => {
        const { strokeName, ...setFields } = set;
        const exerciseId = exerciseIdByNormalizedName.get(normalizeExerciseName(strokeName));
        if (exerciseId === undefined) {
          throw new UnresolvedSwimStrokeError(strokeName);
        }
        return { ...setFields, exerciseId, exerciseName: strokeName };
      }),
    })),
  }));
}
