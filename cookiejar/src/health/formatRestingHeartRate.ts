import { missingHealthValue } from '@/health/formatSteps';

export function formatRestingHeartRate(restingHeartRate: number | null): string {
  if (restingHeartRate === null) {
    return missingHealthValue;
  }
  return `${Math.max(0, Math.round(restingHeartRate))} bpm`;
}
