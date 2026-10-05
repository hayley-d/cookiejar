import { Box } from '@/components/primitives/Box';
import { useTheme } from '@/theme/useTheme';
import type { SupersetBracketPosition } from '@/workouts/supersetCardPositions';

type SupersetBracketProperties = {
  position: SupersetBracketPosition;
};

export function SupersetBracket({ position }: SupersetBracketProperties) {
  const theme = useTheme();
  const isStart = position === 'start';
  const isEnd = position === 'end';

  return (
    <Box
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        bottom: isEnd ? 0 : -theme.spacing.medium,
        width: theme.spacing.small,
        backgroundColor: theme.colors.accent,
        borderTopLeftRadius: isStart ? theme.radii.round : theme.radii.none,
        borderTopRightRadius: isStart ? theme.radii.round : theme.radii.none,
        borderBottomLeftRadius: isEnd ? theme.radii.round : theme.radii.none,
        borderBottomRightRadius: isEnd ? theme.radii.round : theme.radii.none,
      }}
    />
  );
}
