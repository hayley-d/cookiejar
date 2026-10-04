import type { Ref } from 'react';
import { SectionList, type DefaultSectionT, type SectionListProps } from 'react-native';

import type { SpacingName } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

type SectionedListProperties<Item, Section> = Omit<SectionListProps<Item, Section>, 'contentContainerStyle'> & {
  ref?: Ref<SectionList<Item, Section>>;
  padding?: SpacingName;
  gap?: SpacingName;
};

export type SectionedListHandle<Item, Section = DefaultSectionT> = SectionList<Item, Section>;

export function SectionedList<Item, Section = DefaultSectionT>({
  padding = 'medium',
  gap = 'small',
  ...sectionListProperties
}: SectionedListProperties<Item, Section>) {
  const theme = useTheme();

  return (
    <SectionList
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={{ flexGrow: 1, padding: theme.spacing[padding], gap: theme.spacing[gap] }}
      {...sectionListProperties}
    />
  );
}
