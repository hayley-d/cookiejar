import { toLocalDateString } from '@/dates/toLocalDateString';
import type { TrainingTotalsRange } from '@/types/TrainingTotals';

export function currentMonthRange(today: Date): TrainingTotalsRange {
  const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  return { startDate: toLocalDateString(firstOfMonth), endDate: toLocalDateString(lastOfMonth) };
}

export function lifetimeRange(today: Date): TrainingTotalsRange {
  return { startDate: null, endDate: toLocalDateString(today) };
}
