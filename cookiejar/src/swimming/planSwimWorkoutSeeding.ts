import type { DefaultSwimWorkout } from '@/swimming/defaultSwimWorkouts';

export type StoredBuiltInSwimWorkout = {
  workoutId: number;
  builtInKey: string;
};

export type SwimWorkoutSeedingInput = {
  storedBuiltInWorkouts: StoredBuiltInSwimWorkout[];
  storedVersion: string | null;
  contentVersion: string;
  dismissedKeys: string[];
  content: DefaultSwimWorkout[];
};

export type SwimWorkoutUpdate = {
  workoutId: number;
  workout: DefaultSwimWorkout;
};

export type SwimWorkoutSeedingPlan = {
  inserts: DefaultSwimWorkout[];
  updates: SwimWorkoutUpdate[];
};

export function planSwimWorkoutSeeding(input: SwimWorkoutSeedingInput): SwimWorkoutSeedingPlan {
  if (input.storedVersion === input.contentVersion) {
    return { inserts: [], updates: [] };
  }

  const dismissedKeys = new Set(input.dismissedKeys);
  const workoutIdByKey = new Map(
    input.storedBuiltInWorkouts.map((stored) => [stored.builtInKey, stored.workoutId] as const),
  );
  const plan: SwimWorkoutSeedingPlan = { inserts: [], updates: [] };

  for (const workout of input.content) {
    if (dismissedKeys.has(workout.builtInKey)) {
      continue;
    }
    const storedWorkoutId = workoutIdByKey.get(workout.builtInKey);
    if (storedWorkoutId === undefined) {
      plan.inserts.push(workout);
    } else {
      plan.updates.push({ workoutId: storedWorkoutId, workout });
    }
  }
  return plan;
}
