import { ScrollView, type ScrollViewProps } from 'react-native';

import type { SpacingName } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

type ScrollBoxProperties = Omit<ScrollViewProps, 'contentContainerStyle'> & {
  padding?: SpacingName;
  gap?: SpacingName;
};

export function ScrollBox({ padding = 'medium', gap = 'medium', ...scrollViewProperties }: ScrollBoxProperties) {
  const theme = useTheme();

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      contentContainerStyle={{ padding: theme.spacing[padding], gap: theme.spacing[gap] }}
      {...scrollViewProperties}
    />
  );
}
