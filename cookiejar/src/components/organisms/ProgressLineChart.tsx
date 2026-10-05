import { Line, Scatter } from 'victory-native';

import { ProgressChartFrame } from '@/components/organisms/ProgressChartFrame';
import type { ChartValueFormatter } from '@/progress/describeChart';
import { toChartDayNumber } from '@/progress/chartDayNumber';
import { useTheme } from '@/theme/useTheme';
import type { ChartPoint } from '@/types/ChartPoint';

type ProgressLineChartProperties = {
  points: ChartPoint[];
  unit: string;
  formatValue?: ChartValueFormatter;
  referenceValue?: number;
  emphasisedDates?: string[];
};

export function ProgressLineChart({
  points,
  unit,
  formatValue,
  referenceValue,
  emphasisedDates,
}: ProgressLineChartProperties) {
  const theme = useTheme();
  const emphasisedDays = new Set((emphasisedDates ?? []).map(toChartDayNumber));

  return (
    <ProgressChartFrame
      points={points}
      unit={unit}
      formatValue={formatValue}
      referenceValue={referenceValue}
      startsAtZero={false}
      hasBottomPadding
      horizontalPadding={theme.sizes.chartEdgePadding}
      selectionHint="Tap a point to see its value"
      renderMarks={({ points: chartPoints }) => (
        <>
          <Line
            points={chartPoints.value}
            color={theme.colors.chart}
            strokeWidth={theme.sizes.chartLineWidth}
            curveType="linear"
          />
          <Scatter
            points={chartPoints.value}
            color={theme.colors.chart}
            radius={(chartPoint) =>
              emphasisedDays.has(Number(chartPoint.xValue)) ? theme.sizes.chartEmphasisedDot : theme.sizes.chartDot
            }
          />
        </>
      )}
    />
  );
}
