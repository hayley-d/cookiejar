import { Card } from '@/components/atoms/Card';
import { NuggieImage } from '@/components/atoms/NuggieImage';
import { Box } from '@/components/primitives/Box';
import { Touchable } from '@/components/primitives/Touchable';
import { Typography } from '@/components/primitives/Typography';
import { chooseNuggie } from '@/nuggies/chooseNuggie';
import { describeClassCount } from '@/progress/formatClassStatistics';
import { useTheme } from '@/theme/useTheme';
import { activityTypeLabels, type ActivityType } from '@/types/ActivityType';

type ActivityCountTileProperties = {
  activityType: ActivityType;
  sessionCount: number;
  onPress: () => void;
};

export function ActivityCountTile({ activityType, sessionCount, onPress }: ActivityCountTileProperties) {
  const theme = useTheme();
  const label = activityTypeLabels[activityType];

  return (
    <Touchable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label}, ${sessionCount} ${sessionCount === 1 ? 'log' : 'logs'}`}
      accessibilityHint="Opens activity statistics"
    >
      <Card padding="small">
        <Box direction="row" align="center" gap="small">
          <NuggieImage
            name={chooseNuggie({ kind: 'activityDisplay', activityType }, new Date())}
            size={theme.sizes.statTileNuggie}
          />
          <Box>
            <Typography variant="heading">{describeClassCount(sessionCount)}</Typography>
            <Typography variant="caption" color="textSecondary">
              {label}
            </Typography>
          </Box>
        </Box>
      </Card>
    </Touchable>
  );
}
