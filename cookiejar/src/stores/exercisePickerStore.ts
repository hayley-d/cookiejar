import { useEffect, useSyncExternalStore } from 'react';

export type ExercisePickResult = {
  exerciseIds: number[];
  asSuperset: boolean;
};

const pickResultsByRequestIdentifier = new Map<string, ExercisePickResult | null>();
const listeners = new Set<() => void>();
let requestCount = 0;

function notifyListeners() {
  for (const listener of listeners) {
    listener();
  }
}

export function subscribeToExercisePicks(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function createExercisePickRequestIdentifier() {
  requestCount += 1;
  return `exercise-pick-${Date.now()}-${requestCount}`;
}

export function beginExercisePick(requestIdentifier: string) {
  const hadResult = (pickResultsByRequestIdentifier.get(requestIdentifier) ?? null) !== null;
  pickResultsByRequestIdentifier.set(requestIdentifier, null);
  if (hadResult) {
    notifyListeners();
  }
}

export function completeExercisePick(requestIdentifier: string, result: ExercisePickResult) {
  if (pickResultsByRequestIdentifier.get(requestIdentifier) !== null) {
    return;
  }
  pickResultsByRequestIdentifier.set(requestIdentifier, result);
  notifyListeners();
}

export function peekExercisePickResult(requestIdentifier: string) {
  return pickResultsByRequestIdentifier.get(requestIdentifier) ?? null;
}

export function consumeExercisePickResult(requestIdentifier: string) {
  const result = peekExercisePickResult(requestIdentifier);
  if (result === null) {
    return null;
  }
  pickResultsByRequestIdentifier.delete(requestIdentifier);
  notifyListeners();
  return result;
}

export function resetExercisePicks() {
  pickResultsByRequestIdentifier.clear();
  notifyListeners();
}

export function useExercisePickResult(requestIdentifier: string | null) {
  const result = useSyncExternalStore(subscribeToExercisePicks, () =>
    requestIdentifier === null ? null : peekExercisePickResult(requestIdentifier),
  );

  useEffect(() => {
    if (result !== null && requestIdentifier !== null) {
      consumeExercisePickResult(requestIdentifier);
    }
  }, [result, requestIdentifier]);

  return result;
}
