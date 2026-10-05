import { Circle, DashPathEffect, Line as StraightLine, matchFont, vec } from '@shopify/react-native-skia';
import { useMemo, useRef, useState } from 'react';
import type { GestureResponderEvent } from 'react-native';
import { Bar, CartesianChart, type Scale } from 'victory-native';

import { Box } from '@/components/primitives/Box';
import { Touchable } from '@/components/primitives/Touchable';
import { Typography } from '@/components/primitives/Typography';
import { formatDayMonth } from '@/dates/formatDayMonth';
import { chartDayTicks, fromChartDayNumber, toChartDayNumber } from '@/progress/chartDayNumber';
import { describeChartPoint, describeChartSummary } from '@/progress/describeChart';
import { findNearestPointIndex } from '@/progress/findNearestPointIndex';
import { fitValueAxis } from '@/progress/fitValueAxis';
import { useTheme } from '@/theme/useTheme';
import type { ChartPoint } from '@/types/ChartPoint';

type ProgressBarChartProperties = {
  points: ChartPoint[];
  unit: string;
  referenceValue?: number;
};

type ChartDatum = {
  day: number;
  value: number;
};

export function ProgressBarChart({ points, unit, referenceValue }: ProgressBarChartProperties) {
  const theme = useTheme();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const xScaleReference = useRef<Scale | null>(null);

  const font = useMemo(
    () => matchFont({ fontSize: theme.typography.caption.fontSize }),
    [theme.typography.caption.fontSize],
  );
  const data = useMemo<ChartDatum[]>(
    () => points.map((point) => ({ day: toChartDayNumber(point.date), value: point.value })),
    [points],
  );
  const valueAxis = fitValueAxis(
    referenceValue === undefined
      ? points.map((point) => point.value)
      : [...points.map((point) => point.value), referenceValue],
    { startsAtZero: true },
  );
  const dayTicks = chartDayTicks(data.map((datum) => datum.day));
  const selectedPoint = points.find((point) => point.date === selectedDate) ?? null;
  const edgePadding = theme.sizes.chartEdgePadding;
  const barMaximumWidth = theme.sizes.chartBarMaximumWidth;

  function selectNearestPoint(event: GestureResponderEvent) {
    const xScale = xScaleReference.current;
    if (xScale === null) {
      return;
    }
    const nearestIndex = findNearestPointIndex(
      data.map((datum) => xScale(datum.day)),
      event.nativeEvent.locationX,
    );
    setSelectedDate(nearestIndex === null ? null : points[nearestIndex].date);
  }

  return (
    <Box gap="small">
      <Typography variant="caption" color={selectedPoint === null ? 'textSecondary' : 'textPrimary'}>
        {selectedPoint === null ? 'Tap a column to see its value' : describeChartPoint(selectedPoint, unit)}
      </Typography>
      <Touchable
        onPress={selectNearestPoint}
        accessibilityRole="image"
        accessibilityLabel={describeChartSummary(points, unit, valueAxis)}
        style={{ height: theme.sizes.progressChartHeight }}
      >
        <CartesianChart
          data={data}
          xKey="day"
          yKeys={['value']}
          domain={{ y: [valueAxis.minimum, valueAxis.maximum] }}
          domainPadding={{ left: barMaximumWidth, right: barMaximumWidth, top: edgePadding, bottom: 0 }}
          onScaleChange={(xScale) => {
            xScaleReference.current = xScale;
          }}
          frame={{ lineWidth: 0 }}
          xAxis={{
            font,
            tickValues: dayTicks,
            formatXLabel: (day) => formatDayMonth(fromChartDayNumber(day)),
            labelColor: theme.colors.textSecondary,
            lineWidth: 0,
          }}
          yAxis={[
            {
              font,
              tickValues: valueAxis.ticks,
              domain: [valueAxis.minimum, valueAxis.maximum],
              formatYLabel: (value) => String(value),
              labelColor: theme.colors.textSecondary,
              lineColor: theme.colors.border,
              lineWidth: theme.sizes.chartGridLineWidth,
            },
          ]}
        >
          {({ points: chartPoints, chartBounds, xScale, yScale }) => {
            const firstDay = data.length === 0 ? 0 : data[0].day;
            const lastDay = data.length === 0 ? 0 : data[data.length - 1].day;
            const pixelsPerDay =
              lastDay === firstDay ? Infinity : (xScale(lastDay) - xScale(firstDay)) / (lastDay - firstDay);
            const barWidth = Math.min(barMaximumWidth, pixelsPerDay * theme.sizes.chartBarWidthRatio);
            return (
              <>
                {referenceValue === undefined ? null : (
                  <StraightLine
                    p1={vec(chartBounds.left, yScale(referenceValue))}
                    p2={vec(chartBounds.right, yScale(referenceValue))}
                    color={theme.colors.textSecondary}
                    strokeWidth={theme.sizes.chartGridLineWidth}
                  >
                    <DashPathEffect intervals={[theme.sizes.chartReferenceDash, theme.sizes.chartReferenceDash]} />
                  </StraightLine>
                )}
                <Bar
                  points={chartPoints.value}
                  chartBounds={chartBounds}
                  color={theme.colors.chart}
                  barWidth={barWidth}
                  roundedCorners={{
                    topLeft: theme.sizes.chartBarCornerRadius,
                    topRight: theme.sizes.chartBarCornerRadius,
                  }}
                />
                {selectedPoint === null ? null : (
                  <>
                    <Circle
                      cx={xScale(toChartDayNumber(selectedPoint.date))}
                      cy={yScale(selectedPoint.value)}
                      r={theme.sizes.chartHighlightDot + theme.sizes.chartHighlightRing}
                      color={theme.colors.surface}
                    />
                    <Circle
                      cx={xScale(toChartDayNumber(selectedPoint.date))}
                      cy={yScale(selectedPoint.value)}
                      r={theme.sizes.chartHighlightDot}
                      color={theme.colors.textPrimary}
                    />
                  </>
                )}
              </>
            );
          }}
        </CartesianChart>
      </Touchable>
    </Box>
  );
}
