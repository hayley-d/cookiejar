import type { TrackingType } from '@/types/TrackingType';

export type WorkoutItem = {
  id: number;
  workoutId: number;
  exerciseId: number;
  position: number;
  supersetGroup: string | null;
  trackingType: TrackingType;
  restSeconds: number | null;
  notes: string | null;
};
