import { selectWeighIns, type WeightChangeMeasurement } from '@/progress/calculateWeightChange';
import type { ChartPoint } from '@/types/ChartPoint';

export function selectWeightPoints(measurements: WeightChangeMeasurement[], today: string): ChartPoint[] {
  const points: ChartPoint[] = [];
  for (const weighIn of selectWeighIns(measurements, today)) {
    const point = { date: weighIn.measuredOn, value: weighIn.weightKilograms };
    if (points.length > 0 && points[points.length - 1].date === point.date) {
      points[points.length - 1] = point;
    } else {
      points.push(point);
    }
  }
  return points;
}
