import { isHealthDataAvailable, requestAuthorization } from '@kingstinct/react-native-healthkit';

import type { HealthAuthorizationOutcome } from '@/health/HealthTypes';

export const healthReadTypesVersion = 2;

const healthReadTypes = [
  'HKQuantityTypeIdentifierStepCount',
  'HKCategoryTypeIdentifierSleepAnalysis',
  'HKQuantityTypeIdentifierRestingHeartRate',
  'HKQuantityTypeIdentifierHeartRate',
  'HKQuantityTypeIdentifierDistanceWalkingRunning',
  'HKQuantityTypeIdentifierDistanceCycling',
  'HKWorkoutTypeIdentifier',
] as const;

export async function requestHealthAuthorization(): Promise<HealthAuthorizationOutcome> {
  try {
    if (!isHealthDataAvailable()) {
      return 'unavailable';
    }
    const wasRequestCompleted = await requestAuthorization({ toRead: healthReadTypes });
    return wasRequestCompleted ? 'authorized' : 'denied';
  } catch {
    return 'unavailable';
  }
}
