import { formatShortDate } from '@/dates/formatShortDate';
import type { ChartPoint } from '@/types/ChartPoint';

export function describeChartPoint(point: ChartPoint, unit: string): string {
  return `${formatShortDate(point.date)} · ${point.value} ${unit}`;
}

export function describeChartSummary(
  points: readonly ChartPoint[],
  unit: string,
  axis: { minimum: number; maximum: number },
): string {
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];
  if (firstPoint === undefined) {
    return `No values in ${unit}`;
  }
  return `${points.length} values in ${unit} from ${formatShortDate(firstPoint.date)} to ${formatShortDate(lastPoint.date)}, between ${axis.minimum} and ${axis.maximum}`;
}
