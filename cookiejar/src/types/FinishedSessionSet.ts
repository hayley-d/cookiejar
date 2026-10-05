import type { CompletedSet } from '@/progress/detectPersonalRecords';

export type FinishedSessionSet = {
  sessionId: number;
  startedAt: string;
  workoutName: string;
  exerciseName: string;
  exerciseImageUrl: string | null;
  set: CompletedSet;
};
