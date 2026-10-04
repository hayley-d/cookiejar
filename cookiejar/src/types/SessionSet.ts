export type SessionSet = {
  id: number;
  sessionExerciseId: number;
  position: number;
  targetRepetitions: number | null;
  targetWeightKilograms: number | null;
  targetDurationSeconds: number | null;
  targetDistanceMeters: number | null;
  repetitions: number | null;
  weightKilograms: number | null;
  durationSeconds: number | null;
  distanceMeters: number | null;
  completedAt: string | null;
};
