import type { ReactNode } from 'react';

import { Box } from '@/components/primitives/Box';
import { Touchable } from '@/components/primitives/Touchable';
import { Typography } from '@/components/primitives/Typography';
import { useTheme } from '@/theme/useTheme';

type DayChipProperties = {
  weekdayLetter: string;
  dayOfMonth: number;
  isSelected: boolean;
  isToday: boolean;
  accessibilityLabel: string;
  onPress: () => void;
  marker?: ReactNode;
};

export function DayChip({
  weekdayLetter,
  dayOfMonth,
  isSelected,
  isToday,
  accessibilityLabel,
  onPress,
  marker,
}: DayChipProperties) {
  const theme = useTheme();

  return (
    <Touchable
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected: isSelected }}
      style={{ alignItems: 'center', gap: theme.spacing.extraSmall }}
    >
      <Typography variant="caption" color="textSecondary">
        {weekdayLetter}
      </Typography>
      <Box
        align="center"
        justify="center"
        radius="round"
        background={isSelected ? 'accent' : undefined}
        style={{
          width: theme.sizes.dayChipCircle,
          height: theme.sizes.dayChipCircle,
          borderWidth: isToday ? theme.sizes.todayRingWidth : 0,
          borderColor: theme.colors.accent,
        }}
      >
        <Typography variant="label" color={isSelected ? 'onAccent' : 'textPrimary'}>
          {dayOfMonth}
        </Typography>
      </Box>
      <Box align="center" justify="center" style={{ height: theme.sizes.dayMarkerSlot }}>
        {marker}
      </Box>
    </Touchable>
  );
}
