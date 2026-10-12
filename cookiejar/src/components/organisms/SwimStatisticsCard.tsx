import { Card } from '@/components/atoms/Card';
import { NuggieImage } from '@/components/atoms/NuggieImage';
import { StatisticLine } from '@/components/molecules/StatisticLine';
import { Box } from '@/components/primitives/Box';
import { Typography } from '@/components/primitives/Typography';
import { describeSwimBest } from '@/progress/detectSwimBests';
import { formatSwimDistance } from '@/swimming/swimDistance';
import { formatSwimPace } from '@/swimming/swimPace';
import type { SwimStatistics, SwimTotals } from '@/types/SwimStatistics';

type SwimStatisticsCardProperties = {
  statistics: SwimStatistics;
};

const nuggieSize = 64;
const noValue = '—';

function describeTotals(totals: SwimTotals): string {
  return `${totals.swimCount} · ${formatSwimDistance(totals.distanceMeters)}`;
}

export function SwimStatisticsCard({ statistics }: SwimStatisticsCardProperties) {
  const { longestDistanceMeters, fastestPaceSecondsPerHundredMeters, strokeDistances } = statistics;

  return (
    <Card>
      <Box gap="medium">
        <Box direction="row" align="center" gap="medium">
          <NuggieImage name="shark" size={nuggieSize} />
          <Box flex={1}>
            <Typography variant="heading">Swimming</Typography>
            <Typography variant="body" color="textSecondary">
              {`× ${statistics.allTime.swimCount}`}
            </Typography>
          </Box>
        </Box>
        <Box gap="extraSmall">
          <StatisticLine label="This month" value={describeTotals(statistics.thisMonth)} />
          <StatisticLine label="All time" value={describeTotals(statistics.allTime)} />
        </Box>
        <Box gap="extraSmall">
          <StatisticLine
            label={describeSwimBest('longestSwim')}
            value={longestDistanceMeters === null ? noValue : formatSwimDistance(longestDistanceMeters)}
          />
          <StatisticLine
            label={describeSwimBest('fastestPace')}
            value={fastestPaceSecondsPerHundredMeters === null ? noValue : formatSwimPace(fastestPaceSecondsPerHundredMeters)}
          />
        </Box>
        {strokeDistances.length === 0 ? null : (
          <Box gap="extraSmall">
            <Typography variant="label" color="textSecondary">
              Distance per stroke
            </Typography>
            {strokeDistances.map((strokeDistance) => (
              <StatisticLine
                key={strokeDistance.strokeName}
                label={strokeDistance.strokeName}
                value={formatSwimDistance(strokeDistance.distanceMeters)}
              />
            ))}
          </Box>
        )}
      </Box>
    </Card>
  );
}
