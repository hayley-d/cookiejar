import type { HealthWorkout } from '@/health/HealthTypes';
import type { ActivityType } from '@/types/ActivityType';
import { splitDurationSeconds } from '@/activities/splitDurationSeconds';

export type ActivityMetricsFromHealthWorkout = {
  activityType: ActivityType | null;
  startTime: Date;
  hours: number | null;
  minutes: number | null;
  distanceKilometers: number | null;
  elevationGainMeters: number | null;
  activeKilocalories: number | null;
  averageHeartRate: number | null;
};

const activityTypesByHealthActivityCode: Readonly<Record<number, ActivityType>> = {
  24: 'hike',
  37: 'run',
  52: 'walk',
};

const metersPerKilometer = 1000;
const distanceDecimalPlaces = 2;

export const activityHealthActivityCodes: readonly number[] = Object.keys(activityTypesByHealthActivityCode).map(Number);

export function activityTypeFromHealthActivityCode(activityTypeCode: number): ActivityType | null {
  return activityTypesByHealthActivityCode[activityTypeCode] ?? null;
}

function roundToDecimalPlaces(value: number, decimalPlaces: number): number {
  const factor = 10 ** decimalPlaces;
  return Math.round(value * factor) / factor;
}

function roundOptional(value: number | null): number | null {
  return value === null ? null : Math.round(value);
}

export function activityMetricsFromHealthWorkout(
  workout: HealthWorkout,
  averageHeartRate: number | null,
): ActivityMetricsFromHealthWorkout {
  const { hours, minutes } = splitDurationSeconds(workout.durationSeconds);
  return {
    activityType: activityTypeFromHealthActivityCode(workout.activityTypeCode),
    startTime: workout.startDate,
    hours,
    minutes,
    distanceKilometers:
      workout.distanceMeters === null
        ? null
        : roundToDecimalPlaces(workout.distanceMeters / metersPerKilometer, distanceDecimalPlaces),
    elevationGainMeters: roundOptional(workout.elevationAscendedMeters),
    activeKilocalories: roundOptional(workout.activeKilocalories),
    averageHeartRate: roundOptional(averageHeartRate),
  };
}
