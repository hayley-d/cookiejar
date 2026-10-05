import { addDays } from '@/dates/addDays';
import { parseLocalDateString } from '@/dates/parseLocalDateString';
import { toLocalDateString } from '@/dates/toLocalDateString';

export type WeightChangeMeasurement = {
  id: number;
  measuredOn: string;
  weightKilograms: number | null;
};

type WeighIn = {
  id: number;
  measuredOn: string;
  weightKilograms: number;
};

export function selectWeighIns(measurements: WeightChangeMeasurement[], today: string): WeighIn[] {
  return measurements
    .filter(
      (measurement): measurement is WeighIn => measurement.weightKilograms !== null && measurement.measuredOn <= today,
    )
    .sort((first, second) => first.measuredOn.localeCompare(second.measuredOn) || first.id - second.id);
}

export function calculateWeightChange(
  measurements: WeightChangeMeasurement[],
  days: number,
  today: string,
): number | null {
  const windowStart = toLocalDateString(addDays(parseLocalDateString(today), -days));
  const weighIns = selectWeighIns(measurements, today);

  if (weighIns.length < 2) {
    return null;
  }

  const latest = weighIns[weighIns.length - 1];
  const earlierWeighIns = weighIns.slice(0, -1);
  const onOrBeforeWindowStart = earlierWeighIns.filter((weighIn) => weighIn.measuredOn <= windowStart);
  const baseline =
    onOrBeforeWindowStart.length > 0
      ? onOrBeforeWindowStart[onOrBeforeWindowStart.length - 1]
      : earlierWeighIns.find((weighIn) => weighIn.measuredOn >= windowStart);

  if (baseline === undefined) {
    return null;
  }

  return Math.round((latest.weightKilograms - baseline.weightKilograms) * 10) / 10;
}
