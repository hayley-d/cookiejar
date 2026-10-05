export type ActiveSession = {
  id: number;
  workoutId: number | null;
  planEntryId: number | null;
  workoutName: string;
  scheduledDate: string;
  startedAt: string;
};
