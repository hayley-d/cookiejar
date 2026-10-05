import { addDays } from '@/dates/addDays';
import { parseLocalDateString } from '@/dates/parseLocalDateString';
import { toLocalDateString } from '@/dates/toLocalDateString';
import type { ChartPoint } from '@/types/ChartPoint';

export type ProgressRange = 'thirtyDays' | 'ninetyDays' | 'oneYear' | 'threeMonths' | 'sixMonths' | 'all';

export const progressRangeLabels: Record<ProgressRange, string> = {
  thirtyDays: '30 d',
  ninetyDays: '90 d',
  oneYear: '1 y',
  threeMonths: '3 m',
  sixMonths: '6 m',
  all: 'All',
};

function subtractMonths(date: Date, count: number): Date {
  const targetMonthStart = new Date(date.getFullYear(), date.getMonth() - count, 1);
  const lastDayOfTargetMonth = new Date(targetMonthStart.getFullYear(), targetMonthStart.getMonth() + 1, 0).getDate();
  return new Date(
    targetMonthStart.getFullYear(),
    targetMonthStart.getMonth(),
    Math.min(date.getDate(), lastDayOfTargetMonth),
  );
}

export function rangeStartDate(range: ProgressRange, today: string): string | null {
  const todayDate = parseLocalDateString(today);
  switch (range) {
    case 'thirtyDays':
      return toLocalDateString(addDays(todayDate, -30));
    case 'ninetyDays':
      return toLocalDateString(addDays(todayDate, -90));
    case 'threeMonths':
      return toLocalDateString(subtractMonths(todayDate, 3));
    case 'sixMonths':
      return toLocalDateString(subtractMonths(todayDate, 6));
    case 'oneYear':
      return toLocalDateString(subtractMonths(todayDate, 12));
    case 'all':
      return null;
  }
}

export function filterPointsToRange(points: ChartPoint[], range: ProgressRange, today: string): ChartPoint[] {
  const startDate = rangeStartDate(range, today);
  return points.filter((point) => point.date <= today && (startDate === null || point.date >= startDate));
}
