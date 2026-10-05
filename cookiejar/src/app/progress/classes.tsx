import { EmptyState } from '@/components/molecules/EmptyState';
import { ClassStatisticsCard } from '@/components/organisms/ClassStatisticsCard';
import { Box } from '@/components/primitives/Box';
import { ScrollBox } from '@/components/primitives/ScrollBox';
import { useClassStatistics } from '@/hooks/useClassStatistics';

export default function ClassStatisticsScreen() {
  const { classStatistics, hasLoadFailed } = useClassStatistics();

  if (classStatistics === null) {
    return hasLoadFailed ? (
      <EmptyState title="Could not load classes" message="Something went wrong. Please try again." />
    ) : null;
  }

  if (classStatistics.length === 0) {
    return <EmptyState nuggie="yoga" title="No classes yet" message="Finish a class to see its statistics." />;
  }

  return (
    <ScrollBox>
      <Box gap="medium">
        {classStatistics.map((statistics) => (
          <ClassStatisticsCard key={statistics.classType} statistics={statistics} />
        ))}
      </Box>
    </ScrollBox>
  );
}
