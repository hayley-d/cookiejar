import type { AverageComparison } from '@/health/compareToAverage';

export function describeRestingHeartRateTrend(comparison: AverageComparison): string {
  if (comparison.direction === 'level') {
    return 'level with 7-day average';
  }
  const absoluteDifference = Math.abs(comparison.difference);
  const unit = absoluteDifference === 1 ? 'beat' : 'beats';
  return `${comparison.direction} ${absoluteDifference} ${unit} per minute from 7-day average`;
}
