import type { HealthWorkout } from "@/health/HealthTypes";
import { isGarminSource } from "@/health/isGarminSource";

const minimumOverlapFraction = 0.5;

function overlapMilliseconds(
  workout: HealthWorkout,
  sessionStart: Date,
  sessionEnd: Date,
): number {
  const overlapStart = Math.max(
    workout.startDate.getTime(),
    sessionStart.getTime(),
  );
  const overlapEnd = Math.min(workout.endDate.getTime(), sessionEnd.getTime());
  return Math.max(0, overlapEnd - overlapStart);
}

export function findSuggestedHealthWorkout(
  sessionStart: Date,
  sessionEnd: Date,
  workouts: readonly HealthWorkout[],
): HealthWorkout | null {
  const sessionMilliseconds = sessionEnd.getTime() - sessionStart.getTime();
  if (!(sessionMilliseconds > 0)) {
    return null;
  }
  const qualifyingWorkouts = workouts.filter(
    (workout) =>
      isGarminSource(workout) &&
      overlapMilliseconds(workout, sessionStart, sessionEnd) /
        sessionMilliseconds >=
        minimumOverlapFraction,
  );
  return qualifyingWorkouts.length === 1 ? qualifyingWorkouts[0] : null;
}
