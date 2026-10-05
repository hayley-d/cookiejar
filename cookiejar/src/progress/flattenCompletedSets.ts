import type { CompletedSet } from '@/progress/detectPersonalRecords';
import type { TrackingType } from '@/types/TrackingType';

type FlattenableSession = {
  exercises: readonly {
    exerciseId: number;
    trackingType: TrackingType;
    sets: readonly {
      repetitions: number | null;
      weightKilograms: number | null;
      durationSeconds: number | null;
      distanceMeters: number | null;
      completedAt: string | null;
    }[];
  }[];
};

export function flattenCompletedSets(session: FlattenableSession): CompletedSet[] {
  return session.exercises.flatMap((exercise) =>
    exercise.sets
      .filter((set) => set.completedAt !== null)
      .map((set) => ({
        exerciseId: exercise.exerciseId,
        trackingType: exercise.trackingType,
        repetitions: set.repetitions,
        weightKilograms: set.weightKilograms,
        durationSeconds: set.durationSeconds,
        distanceMeters: set.distanceMeters,
      })),
  );
}
