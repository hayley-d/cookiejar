import { EmptyState } from '@/components/molecules/EmptyState';
import { ActivityStatisticsCard } from '@/components/organisms/ActivityStatisticsCard';
import { Box } from '@/components/primitives/Box';
import { ScrollBox } from '@/components/primitives/ScrollBox';
import { useActivityStatistics } from '@/hooks/useActivityStatistics';

export default function ActivityStatisticsScreen() {
  const { activityStatistics, hasLoadFailed } = useActivityStatistics();

  if (activityStatistics === null) {
    return hasLoadFailed ? (
      <EmptyState title="Could not load activities" message="Something went wrong. Please try again." />
    ) : null;
  }

  if (activityStatistics.length === 0) {
    return (
      <EmptyState nuggie="hiking" title="No activities yet" message="Log an activity to see its statistics." />
    );
  }

  return (
    <ScrollBox>
      <Box gap="medium">
        {activityStatistics.map((statistics) => (
          <ActivityStatisticsCard key={statistics.activityType} statistics={statistics} />
        ))}
      </Box>
    </ScrollBox>
  );
}
