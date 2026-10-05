import type { ReactNode } from 'react';

import { TrendArrow } from '@/components/atoms/TrendArrow';
import { HealthPermissionCard } from '@/components/molecules/HealthPermissionCard';
import { StatTile } from '@/components/molecules/StatTile';
import { Box } from '@/components/primitives/Box';
import { ProgressRingBox } from '@/components/primitives/ProgressRingBox';
import type { AverageComparison } from '@/health/compareToAverage';
import { describeStepProgress } from '@/health/describeStepProgress';
import { formatRestingHeartRate } from '@/health/formatRestingHeartRate';
import { formatSleepMinutes } from '@/health/formatSleepMinutes';
import { formatSteps } from '@/health/formatSteps';
import { chooseNuggie } from '@/nuggies/chooseNuggie';
import { useTheme } from '@/theme/useTheme';

const lowSleepMinutes = 360;
const noDataCaption = 'No data yet';
const trendCaption = 'vs 7-day avg';

type StatTileGridProperties = {
  hasRequestedAuthorization: boolean | null;
  isConnecting: boolean;
  onConnect: () => void;
  steps: number | null;
  sleepMinutes: number | null;
  restingHeartRate: number | null;
  restingHeartRateTrend?: AverageComparison | null;
  dailyStepGoal: number;
  now: Date;
  weeklyTile?: ReactNode;
};

export function StatTileGrid({
  hasRequestedAuthorization,
  isConnecting,
  onConnect,
  steps,
  sleepMinutes,
  restingHeartRate,
  restingHeartRateTrend = null,
  dailyStepGoal,
  now,
  weeklyTile,
}: StatTileGridProperties) {
  const theme = useTheme();

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
  const isSleepLow = sleepMinutes !== null && sleepMinutes < lowSleepMinutes;

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
    />
  );

  const restingHeartRateTile = (
    <StatTile
      icon="heart.fill"
      label="Resting HR"
      value={formatRestingHeartRate(restingHeartRate)}
      caption={restingHeartRate === null ? noDataCaption : restingHeartRateTrend === null ? undefined : trendCaption}
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
