import { FlatList, type FlatListProps } from 'react-native';

import type { SpacingName } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

type ListProperties<Item> = Omit<FlatListProps<Item>, 'contentContainerStyle'> & {
  padding?: SpacingName;
  gap?: SpacingName;
};

export function List<Item>({ padding = 'medium', gap = 'small', ...flatListProperties }: ListProperties<Item>) {
  const theme = useTheme();

  return (
    <FlatList
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ flexGrow: 1, padding: theme.spacing[padding], gap: theme.spacing[gap] }}
      {...flatListProperties}
    />
  );
}
