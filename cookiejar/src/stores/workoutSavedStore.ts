export type WorkoutSavedNotice = {
  workoutName: string;
};

let pendingNotice: WorkoutSavedNotice | null = null;

export function announceWorkoutSaved(workoutName: string) {
  pendingNotice = { workoutName };
}

export function peekWorkoutSavedNotice() {
  return pendingNotice;
}

export function consumeWorkoutSavedNotice() {
  const notice = pendingNotice;
  pendingNotice = null;
  return notice;
}

export function resetWorkoutSavedNotices() {
  pendingNotice = null;
}
