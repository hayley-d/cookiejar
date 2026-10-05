import type { ClassType } from "@/types/ClassType";
import type { WorkoutKind } from "@/types/WorkoutKind";

export type Session = {
  id: number;
  workoutId: number | null;
  planEntryId: number | null;
  workoutName: string;
  workoutKind: WorkoutKind;
  classType: ClassType | null;
  scheduledDate: string;
  startedAt: string;
  finishedAt: string | null;
  notes: string | null;
  healthWorkoutUuid: string | null;
  healthAverageHeartRate: number | null;
  healthMaximumHeartRate: number | null;
  healthActiveKilocalories: number | null;
  healthDurationSeconds: number | null;
};
