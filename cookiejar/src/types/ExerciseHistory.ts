import type { FinishedSessionSet } from '@/types/FinishedSessionSet';
import type { TrackingType } from '@/types/TrackingType';

export type ExerciseHistorySet = FinishedSessionSet & {
  setId: number;
};

export type ExerciseWithHistory = {
  exerciseId: number;
  name: string;
  imageUrl: string | null;
  defaultTrackingType: TrackingType;
  lastPerformedAt: string;
};
