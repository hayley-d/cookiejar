import { Circle, DashPathEffect, Line as StraightLine, matchFont, vec } from '@shopify/react-native-skia';
import { useMemo, useRef, useState, type ReactNode } from 'react';
import type { GestureResponderEvent } from 'react-native';
import { CartesianChart, type CartesianChartRenderArg, type Scale } from 'victory-native';

import { Box } from '@/components/primitives/Box';
import { Touchable } from '@/components/primitives/Touchable';
import { Typography } from '@/components/primitives/Typography';
import { formatDayMonth } from '@/dates/formatDayMonth';
import { chartDayTicks, fromChartDayNumber, toChartDayNumber } from '@/progress/chartDayNumber';
import { describeChartPoint, describeChartSummary, type ChartValueFormatter } from '@/progress/describeChart';
import { findNearestPointIndex } from '@/progress/findNearestPointIndex';
import { fitValueAxis } from '@/progress/fitValueAxis';
import { useTheme } from '@/theme/useTheme';
import type { ChartPoint } from '@/types/ChartPoint';

type ChartDatum = {
  day: number;
  value: number;
};

export type ProgressChartMarksArguments = CartesianChartRenderArg<ChartDatum, 'value'>;

type ProgressChartFrameProperties = {
  points: ChartPoint[];
  unit: string;
  formatValue?: ChartValueFormatter;
  referenceValue?: number;
  startsAtZero: boolean;
  hasBottomPadding: boolean;
  horizontalPadding: number;
  selectionHint: string;
  renderMarks: (chart: ProgressChartMarksArguments) => ReactNode;
};

export function ProgressChartFrame({
  points,
  unit,
  formatValue,
  referenceValue,
  startsAtZero,
  hasBottomPadding,
  horizontalPadding,
  selectionHint,
  renderMarks,
}: ProgressChartFrameProperties) {
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
    { startsAtZero },
  );
  const dayTicks = chartDayTicks(data.map((datum) => datum.day));
  const selectedPoint = points.find((point) => point.date === selectedDate) ?? null;
  const edgePadding = theme.sizes.chartEdgePadding;

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
        {selectedPoint === null ? selectionHint : describeChartPoint(selectedPoint, unit, formatValue)}
      </Typography>
      <Touchable
        onPress={selectNearestPoint}
        accessibilityRole="image"
        accessibilityLabel={describeChartSummary(points, unit, valueAxis, formatValue)}
        style={{ height: theme.sizes.progressChartHeight }}
      >
        <CartesianChart
          data={data}
          xKey="day"
          yKeys={['value']}
          domain={{ y: [valueAxis.minimum, valueAxis.maximum] }}
          domainPadding={{
            left: horizontalPadding,
            right: horizontalPadding,
            top: edgePadding,
            bottom: hasBottomPadding ? edgePadding : 0,
          }}
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
              formatYLabel: (value) => (formatValue === undefined ? String(value) : formatValue(value)),
              labelColor: theme.colors.textSecondary,
              lineColor: theme.colors.border,
              lineWidth: theme.sizes.chartGridLineWidth,
            },
          ]}
        >
          {(chart) => (
            <>
              {referenceValue === undefined ? null : (
                <StraightLine
                  p1={vec(chart.chartBounds.left, chart.yScale(referenceValue))}
                  p2={vec(chart.chartBounds.right, chart.yScale(referenceValue))}
                  color={theme.colors.textSecondary}
                  strokeWidth={theme.sizes.chartGridLineWidth}
                >
                  <DashPathEffect intervals={[theme.sizes.chartReferenceDash, theme.sizes.chartReferenceDash]} />
                </StraightLine>
              )}
              {renderMarks(chart)}
              {selectedPoint === null ? null : (
                <>
                  <Circle
                    cx={chart.xScale(toChartDayNumber(selectedPoint.date))}
                    cy={chart.yScale(selectedPoint.value)}
                    r={theme.sizes.chartHighlightDot + theme.sizes.chartHighlightRing}
                    color={theme.colors.surface}
                  />
                  <Circle
                    cx={chart.xScale(toChartDayNumber(selectedPoint.date))}
                    cy={chart.yScale(selectedPoint.value)}
                    r={theme.sizes.chartHighlightDot}
                    color={theme.colors.textPrimary}
                  />
                </>
              )}
            </>
          )}
        </CartesianChart>
      </Touchable>
    </Box>
  );
}
