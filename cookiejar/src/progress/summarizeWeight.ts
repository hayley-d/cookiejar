import { calculateWeightChange, selectWeighIns, type WeightChangeMeasurement } from '@/progress/calculateWeightChange';

export type WeightSummary = {
  latestWeightKilograms: number;
  change: number | null;
};

export function summarizeWeight(
  measurements: WeightChangeMeasurement[],
  days: number,
  today: string,
): WeightSummary | null {
  const weighIns = selectWeighIns(measurements, today);
  if (weighIns.length === 0) {
    return null;
  }
  return {
    latestWeightKilograms: weighIns[weighIns.length - 1].weightKilograms,
    change: calculateWeightChange(measurements, days, today),
  };
}
