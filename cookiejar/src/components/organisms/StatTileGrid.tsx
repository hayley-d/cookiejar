import type { ReactNode } from 'react';

import { TrendArrow } from '@/components/atoms/TrendArrow';
import { HealthPermissionCard } from '@/components/molecules/HealthPermissionCard';
import { StatTile } from '@/components/molecules/StatTile';
import { Box } from '@/components/primitives/Box';
import { ProgressRingBox } from '@/components/primitives/ProgressRingBox';
import type { AverageComparison } from '@/health/compareToAverage';
import { formatShortDate } from '@/dates/formatShortDate';
import { toLocalDateString } from '@/dates/toLocalDateString';
import { describeStepProgress } from '@/health/describeStepProgress';
import { describeRestingHeartRateTrend } from '@/health/describeRestingHeartRateTrend';
import { formatRestingHeartRate } from '@/health/formatRestingHeartRate';
import { formatSleepMinutes } from '@/health/formatSleepMinutes';
import { formatSteps } from '@/health/formatSteps';
import { shortSleepMinutes } from '@/health/sleepThresholds';
import { chooseNuggie } from '@/nuggies/chooseNuggie';
import type { HealthStatsMetric } from '@/stats/parseStatsMetric';
import { statsDetailHint } from '@/stats/statsDetail';
import { useTheme } from '@/theme/useTheme';

const noDataCaption = 'No data yet';
const trendCaption = 'vs 7-day avg';

type StatTileGridProperties = {
  hasRequestedAuthorization: boolean | null;
  isConnecting: boolean;
  onConnect: () => void;
  steps: number | null;
  sleepMinutes: number | null;
  restingHeartRate: number | null;
  restingHeartRateDate?: string | null;
  restingHeartRateTrend?: AverageComparison | null;
  dailyStepGoal: number;
  now: Date;
  weeklyTile?: ReactNode;
  onOpenMetric?: (metric: HealthStatsMetric) => void;
};

export function StatTileGrid({
  hasRequestedAuthorization,
  isConnecting,
  onConnect,
  steps,
  sleepMinutes,
  restingHeartRate,
  restingHeartRateDate = null,
  restingHeartRateTrend: todayRestingHeartRateTrend = null,
  dailyStepGoal,
  now,
  weeklyTile,
  onOpenMetric,
}: StatTileGridProperties) {
  const theme = useTheme();

  const openMetric = (metric: HealthStatsMetric) =>
    onOpenMetric === undefined ? undefined : () => onOpenMetric(metric);

  const renderHalfWidthRow = (tile: ReactNode) => (
    <Box direction="row" gap="small">
      {tile}
      <Box flex={1} />
    </Box>
  );

  const renderWeeklySlot = () => (weeklyTile === undefined ? null : renderHalfWidthRow(weeklyTile));

  if (hasRequestedAuthorization === null) {
    return renderWeeklySlot();
  }

  if (hasRequestedAuthorization === false) {
    return (
      <Box gap="small">
        <HealthPermissionCard onConnect={onConnect} isConnecting={isConnecting} />
        {renderWeeklySlot()}
      </Box>
    );
  }

  const stepProgress = steps === null ? null : describeStepProgress(steps, dailyStepGoal);
  const isRestingHeartRateFromEarlierDay =
    restingHeartRateDate !== null && restingHeartRateDate !== toLocalDateString(now);
  const restingHeartRateTrend = isRestingHeartRateFromEarlierDay ? null : todayRestingHeartRateTrend;
  const restingHeartRateCaption =
    restingHeartRate === null
      ? noDataCaption
      : isRestingHeartRateFromEarlierDay && restingHeartRateDate !== null
        ? `Last reading ${formatShortDate(restingHeartRateDate)}`
        : restingHeartRateTrend === null
          ? undefined
          : trendCaption;
  const isSleepLow = sleepMinutes !== null && sleepMinutes < shortSleepMinutes;

  const stepsTile = (
    <StatTile
      icon="figure.walk"
      label="Steps"
      value={formatSteps(steps)}
      caption={stepProgress === null ? noDataCaption : stepProgress.caption}
      accessory={
        stepProgress === null ? undefined : (
          <ProgressRingBox
            progress={stepProgress.ringProgress}
            size={theme.sizes.statTileRing}
            strokeWidth={theme.sizes.statTileRingStroke}
          />
        )
      }
      tone={stepProgress?.isGoalReached ? 'positive' : 'default'}
      nuggie={stepProgress?.isGoalReached ? chooseNuggie({ kind: 'stepGoalReached' }, now) : undefined}
      onPress={openMetric('steps')}
      accessibilityHint={statsDetailHint}
    />
  );

  const sleepTile = (
    <StatTile
      icon="moon.fill"
      label="Sleep"
      value={formatSleepMinutes(sleepMinutes)}
      caption={sleepMinutes === null ? noDataCaption : 'Last night'}
      tone={isSleepLow ? 'attention' : 'default'}
      nuggie={isSleepLow ? chooseNuggie({ kind: 'lowSleep' }, now) : undefined}
      onPress={openMetric('sleep')}
      accessibilityHint={statsDetailHint}
    />
  );

  const restingHeartRateTile = (
    <StatTile
      icon="heart.fill"
      label="Resting HR"
      value={formatRestingHeartRate(restingHeartRate)}
      caption={restingHeartRateCaption}
      accessory={
        restingHeartRate === null || restingHeartRateTrend === null ? undefined : (
          <TrendArrow
            direction={restingHeartRateTrend.direction}
            difference={restingHeartRateTrend.difference}
            tone={restingHeartRateTrend.tone}
          />
        )
      }
      tone={restingHeartRate === null || restingHeartRateTrend === null ? 'default' : restingHeartRateTrend.tone}
      onPress={openMetric('restingHeartRate')}
      accessibilityHint={statsDetailHint}
      accessibilityDetail={
        restingHeartRate === null || restingHeartRateTrend === null
          ? undefined
          : describeRestingHeartRateTrend(restingHeartRateTrend)
      }
    />
  );

  return (
    <Box gap="small">
      <Box direction="row" gap="small">
        {stepsTile}
        {sleepTile}
      </Box>
      <Box direction="row" gap="small">
        {restingHeartRateTile}
        {weeklyTile ?? <Box flex={1} />}
      </Box>
    </Box>
  );
}
