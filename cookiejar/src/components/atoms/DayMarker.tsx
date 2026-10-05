import { Box } from '@/components/primitives/Box';
import { Icon } from '@/components/primitives/Icon';
import type { DayMarkerState } from '@/plans/dayMarkerState';
import type { ColorName } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

type DayMarkerProperties = {
  state: DayMarkerState;
};

const dotColors: Record<'missed' | 'planned', ColorName> = {
  missed: 'textSecondary',
  planned: 'accent',
};

export function DayMarker({ state }: DayMarkerProperties) {
  const theme = useTheme();

  if (state === 'none') {
    return null;
  }
  if (state === 'completed') {
    return <Icon name="checkmark" size={theme.sizes.dayMarkerSlot} color="success" weight="heavy" />;
  }
  return (
    <Box
      background={dotColors[state]}
      radius="round"
      style={{ width: theme.sizes.dayMarkerDot, height: theme.sizes.dayMarkerDot }}
    />
  );
}
