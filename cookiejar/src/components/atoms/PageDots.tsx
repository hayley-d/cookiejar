import { View } from 'react-native';

import { useTheme } from '@/theme/useTheme';

type PageDotsProperties = {
  count: number;
  activeIndex: number;
};

export function PageDots({ count, activeIndex }: PageDotsProperties) {
  const theme = useTheme();

  return (
    <View
      accessible
      accessibilityLabel={`Page ${activeIndex + 1} of ${count}`}
      style={{ flexDirection: 'row', justifyContent: 'center', gap: theme.spacing.small }}
    >
      {Array.from({ length: count }, (_, index) => (
        <View
          key={index}
          style={{
            width: theme.sizes.pageDot,
            height: theme.sizes.pageDot,
            borderRadius: theme.radii.round,
            backgroundColor: index === activeIndex ? theme.colors.accent : theme.colors.border,
          }}
        />
      ))}
    </View>
  );
}
