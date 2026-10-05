import { TextButton } from '@/components/atoms/TextButton';
import { ClassCountTile } from '@/components/molecules/ClassCountTile';
import { Box } from '@/components/primitives/Box';
import { Typography } from '@/components/primitives/Typography';
import type { ClassStatistics } from '@/types/ClassStatistics';

type ClassCountSectionProperties = {
  statistics: readonly ClassStatistics[];
  onOpenStatistics: () => void;
};

export function ClassCountSection({ statistics, onOpenStatistics }: ClassCountSectionProperties) {
  if (statistics.length === 0) {
    return null;
  }

  return (
    <Box gap="small">
      <Box direction="row" justify="space-between" align="center">
        <Typography variant="heading">Classes</Typography>
        <TextButton label="See all" onPress={onOpenStatistics} />
      </Box>
      <Box gap="small">
        {statistics.map((entry) => (
          <ClassCountTile
            key={entry.classType}
            classType={entry.classType}
            sessionCount={entry.sessionCount}
            onPress={onOpenStatistics}
          />
        ))}
      </Box>
    </Box>
  );
}
