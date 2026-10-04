import { View, type ViewProps } from 'react-native';

import type { SpacingName } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

type CardProperties = ViewProps & {
  padding?: SpacingName;
};

export function Card({ padding = 'medium', style, ...viewProperties }: CardProperties) {
  const theme = useTheme();

  return (
    <View
      style={[
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radii.large,
          padding: theme.spacing[padding],
        },
        theme.shadows.card,
        style,
      ]}
      {...viewProperties}
    />
  );
}
