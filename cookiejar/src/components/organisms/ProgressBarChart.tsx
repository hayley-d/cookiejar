import { Bar } from 'victory-native';

import { ProgressChartFrame } from '@/components/organisms/ProgressChartFrame';
import type { ChartValueFormatter } from '@/progress/describeChart';
import { toChartDayNumber } from '@/progress/chartDayNumber';
import { useTheme } from '@/theme/useTheme';
import type { ChartPoint } from '@/types/ChartPoint';

type ProgressBarChartProperties = {
  points: ChartPoint[];
  unit: string;
  formatValue?: ChartValueFormatter;
  referenceValue?: number;
};

export function ProgressBarChart({ points, unit, formatValue, referenceValue }: ProgressBarChartProperties) {
  const theme = useTheme();
  const barMaximumWidth = theme.sizes.chartBarMaximumWidth;
  const firstDay = points.length === 0 ? 0 : toChartDayNumber(points[0].date);
  const lastDay = points.length === 0 ? 0 : toChartDayNumber(points[points.length - 1].date);

  return (
    <ProgressChartFrame
      points={points}
      unit={unit}
      formatValue={formatValue}
      referenceValue={referenceValue}
      startsAtZero
      hasBottomPadding={false}
      horizontalPadding={barMaximumWidth}
      selectionHint="Tap a column to see its value"
      renderMarks={({ points: chartPoints, chartBounds, xScale }) => {
        const pixelsPerDay =
          lastDay === firstDay ? Infinity : (xScale(lastDay) - xScale(firstDay)) / (lastDay - firstDay);
        return (
          <Bar
            points={chartPoints.value}
            chartBounds={chartBounds}
            color={theme.colors.chart}
            barWidth={Math.min(barMaximumWidth, pixelsPerDay * theme.sizes.chartBarWidthRatio)}
            roundedCorners={{
              topLeft: theme.sizes.chartBarCornerRadius,
              topRight: theme.sizes.chartBarCornerRadius,
            }}
          />
        );
      }}
    />
  );
}
