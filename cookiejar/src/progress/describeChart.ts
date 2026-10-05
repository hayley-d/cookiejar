import { formatShortDate } from '@/dates/formatShortDate';
import type { ChartPoint } from '@/types/ChartPoint';

export type ChartValueFormatter = (value: number) => string;

export function describeChartPoint(point: ChartPoint, unit: string, formatValue?: ChartValueFormatter): string {
  const valueText = formatValue === undefined ? `${point.value} ${unit}` : formatValue(point.value);
  return `${formatShortDate(point.date)} · ${valueText}`;
}

export function describeChartSummary(
  points: readonly ChartPoint[],
  unit: string,
  axis: { minimum: number; maximum: number },
  formatValue?: ChartValueFormatter,
): string {
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];
  const unitText = formatValue === undefined ? ` in ${unit}` : '';
  if (firstPoint === undefined) {
    return `No values${unitText}`;
  }
  const minimumText = formatValue === undefined ? String(axis.minimum) : formatValue(axis.minimum);
  const maximumText = formatValue === undefined ? String(axis.maximum) : formatValue(axis.maximum);
  return `${points.length} values${unitText} from ${formatShortDate(firstPoint.date)} to ${formatShortDate(lastPoint.date)}, between ${minimumText} and ${maximumText}`;
}
