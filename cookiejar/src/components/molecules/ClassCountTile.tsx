import { Card } from '@/components/atoms/Card';
import { NuggieImage } from '@/components/atoms/NuggieImage';
import { Box } from '@/components/primitives/Box';
import { Touchable } from '@/components/primitives/Touchable';
import { Typography } from '@/components/primitives/Typography';
import { chooseNuggie } from '@/nuggies/chooseNuggie';
import { describeClassCount } from '@/progress/formatClassStatistics';
import { useTheme } from '@/theme/useTheme';
import { classTypeLabels, type ClassType } from '@/types/ClassType';

type ClassCountTileProperties = {
  classType: ClassType;
  sessionCount: number;
  onPress: () => void;
};

export function ClassCountTile({ classType, sessionCount, onPress }: ClassCountTileProperties) {
  const theme = useTheme();
  const label = classTypeLabels[classType];

  return (
    <Touchable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${label}, ${sessionCount} ${sessionCount === 1 ? 'session' : 'sessions'}`}
      accessibilityHint="Opens class statistics"
    >
      <Card padding="small">
        <Box direction="row" align="center" gap="small">
          <NuggieImage
            name={chooseNuggie({ kind: 'classDisplay', classType }, new Date())}
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
