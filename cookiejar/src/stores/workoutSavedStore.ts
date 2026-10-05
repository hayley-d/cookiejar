import { useEffect, useSyncExternalStore } from 'react';

export type WorkoutSavedNotice = {
  workoutName: string;
};

let pendingNotice: WorkoutSavedNotice | null = null;
const listeners = new Set<() => void>();

function notifyListeners() {
  for (const listener of listeners) {
    listener();
  }
}

export function subscribeToWorkoutSavedNotices(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function announceWorkoutSaved(workoutName: string) {
  pendingNotice = { workoutName };
  notifyListeners();
}

export function peekWorkoutSavedNotice() {
  return pendingNotice;
}

export function consumeWorkoutSavedNotice() {
  const notice = pendingNotice;
  if (notice === null) {
    return null;
  }
  pendingNotice = null;
  notifyListeners();
  return notice;
}

export function resetWorkoutSavedNotices() {
  pendingNotice = null;
  notifyListeners();
}

export function useWorkoutSavedNotice() {
  const notice = useSyncExternalStore(subscribeToWorkoutSavedNotices, peekWorkoutSavedNotice);

  useEffect(() => {
    if (notice !== null) {
      consumeWorkoutSavedNotice();
    }
  }, [notice]);

  return notice;
}
