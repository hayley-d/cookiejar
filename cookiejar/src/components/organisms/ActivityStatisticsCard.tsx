import { Card } from '@/components/atoms/Card';
import { NuggieImage } from '@/components/atoms/NuggieImage';
import { StatisticLine } from '@/components/molecules/StatisticLine';
import { Box } from '@/components/primitives/Box';
import { Typography } from '@/components/primitives/Typography';
import { formatPace } from '@/activities/derivePace';
import { formatDistance, formatElevationGain } from '@/activities/formatActivityValues';
import { chooseNuggie } from '@/nuggies/chooseNuggie';
import { describeActivityBest } from '@/progress/detectActivityBests';
import { activityTypeLabels } from '@/types/ActivityType';
import type { ActivityStatistics, ActivityTotals } from '@/types/ActivityStatistics';

type ActivityStatisticsCardProperties = {
  statistics: ActivityStatistics;
};

const nuggieSize = 64;
const noValue = '—';

function describeTotals(totals: ActivityTotals): string {
  return `${totals.sessionCount} · ${formatDistance(totals.distanceMeters)} · ${formatElevationGain(totals.elevationGainMeters)}`;
}

export function ActivityStatisticsCard({ statistics }: ActivityStatisticsCardProperties) {
  const { activityType, bests } = statistics;

  return (
    <Card>
      <Box gap="medium">
        <Box direction="row" align="center" gap="medium">
          <NuggieImage name={chooseNuggie({ kind: 'activityDisplay', activityType }, new Date())} size={nuggieSize} />
          <Box flex={1}>
            <Typography variant="heading">{activityTypeLabels[activityType]}</Typography>
            <Typography variant="body" color="textSecondary">
              {`× ${statistics.allTime.sessionCount}`}
            </Typography>
          </Box>
        </Box>
        <Box gap="extraSmall">
          <StatisticLine label="This month" value={describeTotals(statistics.thisMonth)} />
          <StatisticLine label="All time" value={describeTotals(statistics.allTime)} />
        </Box>
        <Box gap="extraSmall">
          <StatisticLine
            label={describeActivityBest('longestDistance', activityType)}
            value={bests.longestDistanceMeters === null ? noValue : formatDistance(bests.longestDistanceMeters)}
          />
          <StatisticLine
            label={describeActivityBest('mostElevation', activityType)}
            value={bests.mostElevationGainMeters === null ? noValue : formatElevationGain(bests.mostElevationGainMeters)}
          />
          <StatisticLine
            label={describeActivityBest('fastestPace', activityType)}
            value={
              bests.fastestPaceSecondsPerKilometer === null ? noValue : formatPace(bests.fastestPaceSecondsPerKilometer)
            }
          />
        </Box>
      </Box>
    </Card>
  );
}
