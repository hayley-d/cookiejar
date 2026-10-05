import { Card } from '@/components/atoms/Card';
import { NuggieImage } from '@/components/atoms/NuggieImage';
import { Box } from '@/components/primitives/Box';
import { Typography } from '@/components/primitives/Typography';
import { chooseNuggie } from '@/nuggies/chooseNuggie';
import { describeClassCount, describeLastClassDate } from '@/progress/formatClassStatistics';
import { formatTimeTrained } from '@/progress/formatTrainingTotals';
import { classTypeLabels } from '@/types/ClassType';
import type { ClassStatistics } from '@/types/ClassStatistics';

type ClassStatisticsCardProperties = {
  statistics: ClassStatistics;
};

const nuggieSize = 64;

export function ClassStatisticsCard({ statistics }: ClassStatisticsCardProperties) {
  const label = classTypeLabels[statistics.classType];

  return (
    <Card>
      <Box gap="medium">
        <Box direction="row" align="center" gap="medium">
          <NuggieImage
            name={chooseNuggie({ kind: 'classDisplay', classType: statistics.classType }, new Date())}
            size={nuggieSize}
          />
          <Box flex={1}>
            <Typography variant="heading">{label}</Typography>
            <Typography variant="body" color="textSecondary">
              {describeClassCount(statistics.sessionCount)}
            </Typography>
          </Box>
        </Box>
        <Box gap="extraSmall">
          <StatisticLine label="Total time" value={formatTimeTrained(statistics.totalSeconds)} />
          <StatisticLine label="This month" value={String(statistics.sessionsThisMonth)} />
          <StatisticLine label="Last class" value={describeLastClassDate(statistics.lastStartedAt)} />
        </Box>
      </Box>
    </Card>
  );
}

type StatisticLineProperties = {
  label: string;
  value: string;
};

function StatisticLine({ label, value }: StatisticLineProperties) {
  return (
    <Box direction="row" justify="space-between" accessible accessibilityLabel={`${label} ${value}`}>
      <Typography variant="body" color="textSecondary">
        {label}
      </Typography>
      <Typography variant="label">{value}</Typography>
    </Box>
  );
}
