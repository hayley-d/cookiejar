import type { TrackingType } from "@/types/TrackingType";

export type SessionExercise = {
  id: number;
  sessionId: number;
  exerciseId: number;
  replacedExerciseId: number | null;
  position: number;
  supersetGroup: string | null;
  trackingType: TrackingType;
};
