import { missingHealthValue } from '@/health/formatSteps';

export const spokenMissingValue = 'no data';

export function describeStatValue(valueText: string): string {
  return valueText === missingHealthValue ? spokenMissingValue : valueText;
}
