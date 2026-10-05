import { queryStatisticsForQuantity, queryWorkoutSamples } from '@kingstinct/react-native-healthkit';

import type { HealthWorkout, WorkoutHeartRate } from '@/health/HealthTypes';

export async function findOverlappingWorkouts(startDate: Date, endDate: Date): Promise<HealthWorkout[]> {
  const workoutProxies = await queryWorkoutSamples({ limit: 0, filter: { date: { startDate, endDate } } });
  const workouts: HealthWorkout[] = [];
  let copyFailure: { error: unknown } | null = null;
  for (const workoutProxy of workoutProxies) {
    try {
      workouts.push({
        uuid: workoutProxy.uuid,
        activityTypeCode: Number(workoutProxy.workoutActivityType),
        startDate: workoutProxy.startDate,
        endDate: workoutProxy.endDate,
        durationSeconds: workoutProxy.duration.quantity,
        activeKilocalories: workoutProxy.totalEnergyBurned?.quantity ?? null,
        sourceName: workoutProxy.sourceRevision?.source.name ?? '',
        bundleIdentifier: workoutProxy.sourceRevision?.source.bundleIdentifier ?? '',
      });
    } catch (error) {
      copyFailure = copyFailure ?? { error };
    } finally {
      workoutProxy.dispose();
    }
  }
  if (copyFailure !== null) {
    throw copyFailure.error;
  }
  return workouts;
}

export async function readWorkoutHeartRate(startDate: Date, endDate: Date): Promise<WorkoutHeartRate> {
  const statistics = await queryStatisticsForQuantity(
    'HKQuantityTypeIdentifierHeartRate',
    ['discreteAverage', 'discreteMax'],
    { filter: { date: { startDate, endDate } }, unit: 'count/min' },
  );
  return {
    averageHeartRate: statistics.averageQuantity?.quantity ?? null,
    maximumHeartRate: statistics.maximumQuantity?.quantity ?? null,
  };
}
