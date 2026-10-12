import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { Card } from '@/components/atoms/Card';
import { HeaderImageCard } from '@/components/molecules/HeaderImageCard';
import { Box } from '@/components/primitives/Box';
import { ScrollBox } from '@/components/primitives/ScrollBox';
import { Typography } from '@/components/primitives/Typography';
import { describeSwimBlockRest, describeSwimRounds, describeSwimSet } from '@/swimming/describeSwimSet';
import { formatSwimDistance, swimSectionDistance, swimWorkoutDistance } from '@/swimming/swimDistance';
import { useTheme } from '@/theme/useTheme';
import { defaultSwimPoolLength } from '@/types/SwimPoolLength';
import type { WorkoutWithItems } from '@/types/WorkoutWithItems';

type SwimWorkoutDetailProperties = {
  workout: WorkoutWithItems;
  onStart: () => void;
};

export function SwimWorkoutDetail({ workout, onStart }: SwimWorkoutDetailProperties) {
  const theme = useTheme();
  const sections = workout.swim?.sections ?? [];
  const hasDescription = workout.description !== null && workout.description.trim().length > 0;

  return (
    <Box flex={1}>
      <ScrollBox gap="medium">
        <HeaderImageCard imageUrl={workout.imageUrl} nuggie="shark" background="accentSoft" />
        <Box gap="small">
          <Typography variant="display">{workout.name}</Typography>
          <Box direction="row" gap="small" align="center">
            <Badge label={`${workout.swim?.poolLengthMeters ?? defaultSwimPoolLength} M POOL`} />
            <Typography color="textSecondary">{formatSwimDistance(swimWorkoutDistance(sections))}</Typography>
          </Box>
        </Box>
        {hasDescription ? <Typography>{workout.description}</Typography> : null}
        {sections.map((section, sectionIndex) => (
          <Card key={sectionIndex}>
            <Box gap="small">
              <Box direction="row" justify="space-between" align="center">
                <Typography variant="heading">{section.name}</Typography>
                <Typography variant="label" color="textSecondary">
                  {formatSwimDistance(swimSectionDistance(section))}
                </Typography>
              </Box>
              {section.blocks.length === 0 ? (
                <Typography color="textSecondary">No sets</Typography>
              ) : null}
              {section.blocks.map((block, blockIndex) => {
                const roundsText = describeSwimRounds(block.rounds);
                const restText = describeSwimBlockRest(block.restAfterSeconds);
                return (
                  <Box key={blockIndex} gap="extraSmall">
                    {roundsText === null ? null : (
                      <Typography variant="label" color="accent">
                        {roundsText}
                      </Typography>
                    )}
                    {block.sets.map((set, setIndex) => (
                      <Box key={setIndex}>
                        <Typography>{describeSwimSet(set)}</Typography>
                      </Box>
                    ))}
                    {restText === null ? null : (
                      <Typography variant="caption" color="textSecondary">
                        {restText}
                      </Typography>
                    )}
                  </Box>
                );
              })}
            </Box>
          </Card>
        ))}
        <Box style={{ height: theme.sizes.detailBottomBarClearance }} />
      </ScrollBox>
      <Box
        padding="medium"
        background="background"
        style={{ position: 'absolute', left: 0, right: 0, bottom: 0 }}
      >
        <Button label="START SWIM" onPress={onStart} />
      </Box>
    </Box>
  );
}
