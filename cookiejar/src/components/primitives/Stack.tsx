import { View, type ViewProps, type ViewStyle } from 'react-native';

import type { SpacingName } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

type StackProperties = ViewProps & {
  direction?: 'vertical' | 'horizontal';
  gap?: SpacingName;
  align?: ViewStyle['alignItems'];
  justify?: ViewStyle['justifyContent'];
};

export function Stack({
  direction = 'vertical',
  gap = 'small',
  align,
  justify,
  style,
  ...viewProperties
}: StackProperties) {
  const theme = useTheme();

  return (
    <View
      style={[
        {
          flexDirection: direction === 'horizontal' ? 'row' : 'column',
          gap: theme.spacing[gap],
          alignItems: align,
          justifyContent: justify,
        },
        style,
      ]}
      {...viewProperties}
    />
  );
}
