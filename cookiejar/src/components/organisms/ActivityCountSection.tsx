import { TextButton } from '@/components/atoms/TextButton';
import { ActivityCountTile } from '@/components/molecules/ActivityCountTile';
import { Box } from '@/components/primitives/Box';
import { Typography } from '@/components/primitives/Typography';
import type { ActivityStatistics } from '@/types/ActivityStatistics';

type ActivityCountSectionProperties = {
  statistics: readonly ActivityStatistics[];
  onOpenStatistics: () => void;
};

export function ActivityCountSection({ statistics, onOpenStatistics }: ActivityCountSectionProperties) {
  if (statistics.length === 0) {
    return null;
  }

  return (
    <Box gap="small">
      <Box direction="row" justify="space-between" align="center">
        <Typography variant="heading">Activities</Typography>
        <TextButton label="See all" onPress={onOpenStatistics} />
      </Box>
      <Box gap="small">
        {statistics.map((entry) => (
          <ActivityCountTile
            key={entry.activityType}
            activityType={entry.activityType}
            sessionCount={entry.allTime.sessionCount}
            onPress={onOpenStatistics}
          />
        ))}
      </Box>
    </Box>
  );
}
