import { Circle, DashPathEffect, Line as StraightLine, matchFont, vec } from '@shopify/react-native-skia';
import { useMemo, useRef, useState } from 'react';
import type { GestureResponderEvent } from 'react-native';
import { CartesianChart, Line, Scatter, type Scale } from 'victory-native';

import { Box } from '@/components/primitives/Box';
import { Touchable } from '@/components/primitives/Touchable';
import { Typography } from '@/components/primitives/Typography';
import { formatDayMonth } from '@/dates/formatDayMonth';
import { formatShortDate } from '@/dates/formatShortDate';
import { chartDayTicks, fromChartDayNumber, toChartDayNumber } from '@/progress/chartDayNumber';
import { findNearestPointIndex } from '@/progress/findNearestPointIndex';
import { fitValueAxis } from '@/progress/fitValueAxis';
import { useTheme } from '@/theme/useTheme';
import type { ChartPoint } from '@/types/ChartPoint';

type ProgressLineChartProperties = {
  points: ChartPoint[];
  unit: string;
  referenceValue?: number;
  emphasisedDates?: string[];
};

type ChartDatum = {
  day: number;
  value: number;
};

function describePoint(point: ChartPoint, unit: string) {
  return `${formatShortDate(point.date)} · ${point.value} ${unit}`;
}

export function ProgressLineChart({ points, unit, referenceValue, emphasisedDates }: ProgressLineChartProperties) {
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
  );
  const dayTicks = chartDayTicks(data.map((datum) => datum.day));
  const emphasisedDays = new Set((emphasisedDates ?? []).map(toChartDayNumber));
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

  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];
  const accessibilityLabel =
    firstPoint === undefined
      ? `No values in ${unit}`
      : `${points.length} values in ${unit} from ${formatShortDate(firstPoint.date)} to ${formatShortDate(lastPoint.date)}, between ${valueAxis.minimum} and ${valueAxis.maximum}`;

  return (
    <Box gap="small">
      <Typography variant="caption" color={selectedPoint === null ? 'textSecondary' : 'textPrimary'}>
        {selectedPoint === null ? 'Tap a point to see its value' : describePoint(selectedPoint, unit)}
      </Typography>
      <Touchable
        onPress={selectNearestPoint}
        accessibilityRole="image"
        accessibilityLabel={accessibilityLabel}
        style={{ height: theme.sizes.progressChartHeight }}
      >
        <CartesianChart
          data={data}
          xKey="day"
          yKeys={['value']}
          domain={{ y: [valueAxis.minimum, valueAxis.maximum] }}
          domainPadding={{ left: edgePadding, right: edgePadding, top: edgePadding, bottom: edgePadding }}
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
          {({ points: chartPoints, chartBounds, xScale, yScale }) => (
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
          )}
        </CartesianChart>
      </Touchable>
    </Box>
  );
}
