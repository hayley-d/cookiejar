import type { Ref } from 'react';
import { ScrollView, type ScrollViewProps } from 'react-native';

import type { SpacingName } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

export type ScrollBoxHandle = ScrollView;

type ScrollBoxProperties = Omit<ScrollViewProps, 'contentContainerStyle'> & {
  ref?: Ref<ScrollView>;
  padding?: SpacingName;
  gap?: SpacingName;
  contentBottomPadding?: number;
};

export function ScrollBox({
  padding = 'medium',
  gap = 'medium',
  contentBottomPadding,
  ...scrollViewProperties
}: ScrollBoxProperties) {
  const theme = useTheme();

  return (
    <ScrollView
      contentInsetAdjustmentBehavior="automatic"
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="interactive"
      contentContainerStyle={{
        padding: theme.spacing[padding],
        gap: theme.spacing[gap],
        ...(contentBottomPadding === undefined ? {} : { paddingBottom: contentBottomPadding }),
      }}
      {...scrollViewProperties}
    />
  );
}
