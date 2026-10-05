import { View } from 'react-native';

import { Typography } from '@/components/primitives/Typography';
import { useTheme } from '@/theme/useTheme';
import type { ScheduledWorkoutStatus } from '@/types/ScheduledWorkout';

type StatusChipProperties = {
  status: ScheduledWorkoutStatus;
  date: string;
  today: string;
};

type ChipAppearance = {
  label: string;
  background: 'success' | 'accent' | 'border';
  text: 'onAccent' | 'textSecondary';
};

function chipAppearance({ status, date, today }: StatusChipProperties): ChipAppearance | null {
  if (status === 'completed') {
    return { label: 'Done', background: 'success', text: 'onAccent' };
  }
  if (status === 'inProgress') {
    return { label: 'In progress', background: 'accent', text: 'onAccent' };
  }
  if (date < today) {
    return { label: 'Missed', background: 'border', text: 'textSecondary' };
  }
  return null;
}

export function StatusChip({ status, date, today }: StatusChipProperties) {
  const theme = useTheme();
  const appearance = chipAppearance({ status, date, today });

  if (appearance === null) {
    return null;
  }

  return (
    <View
      style={{
        alignSelf: 'flex-start',
        backgroundColor: theme.colors[appearance.background],
        borderRadius: theme.radii.round,
        paddingHorizontal: theme.spacing.small + theme.spacing.extraSmall,
        paddingVertical: theme.spacing.extraSmall,
      }}
    >
      <Typography variant="caption" color={appearance.text}>
        {appearance.label}
      </Typography>
    </View>
  );
}
