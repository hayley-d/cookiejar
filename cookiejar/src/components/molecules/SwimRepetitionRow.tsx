import { Box } from '@/components/primitives/Box';
import { Icon } from '@/components/primitives/Icon';
import { Touchable } from '@/components/primitives/Touchable';
import { Typography } from '@/components/primitives/Typography';
import type { SwimSessionRepetition } from '@/swimming/swimSessionTypes';
import { useTheme } from '@/theme/useTheme';

type SwimRepetitionRowProperties = {
  repetitions: SwimSessionRepetition[];
  onToggleRepetition: (repetitionId: number) => void;
};

const circleBorderWidth = 2;
const tickSize = 18;

export function SwimRepetitionRow({ repetitions, onToggleRepetition }: SwimRepetitionRowProperties) {
  const theme = useTheme();

  return (
    <Box direction="row" gap="small" style={{ flexWrap: 'wrap' }}>
      {repetitions.map((repetition) => {
        const isDone = repetition.completedAt !== null;
        const repetitionNumber = repetition.repetitionIndex + 1;
        return (
          <Touchable
            key={repetition.id}
            onPress={() => onToggleRepetition(repetition.id)}
            accessibilityRole="checkbox"
            accessibilityState={{ checked: isDone }}
            accessibilityLabel={`Repetition ${repetitionNumber}`}
            style={{
              width: theme.sizes.minimumTouchTarget,
              height: theme.sizes.minimumTouchTarget,
              borderRadius: theme.radii.round,
              borderWidth: circleBorderWidth,
              borderColor: isDone ? theme.colors.accent : theme.colors.border,
              backgroundColor: isDone ? theme.colors.accent : theme.colors.surface,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {isDone ? (
              <Icon name="checkmark" size={tickSize} color="onAccent" weight="bold" />
            ) : (
              <Typography variant="label" color="textSecondary">
                {repetitionNumber}
              </Typography>
            )}
          </Touchable>
        );
      })}
    </Box>
  );
}
