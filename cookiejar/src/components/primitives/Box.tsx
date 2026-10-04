import { View, type ViewProps, type ViewStyle } from 'react-native';

import type { ColorName, RadiusName, SpacingName } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

type BoxProperties = ViewProps & {
  padding?: SpacingName;
  paddingHorizontal?: SpacingName;
  paddingVertical?: SpacingName;
  gap?: SpacingName;
  direction?: ViewStyle['flexDirection'];
  align?: ViewStyle['alignItems'];
  justify?: ViewStyle['justifyContent'];
  flex?: number;
  background?: ColorName;
  borderColor?: ColorName;
  radius?: RadiusName;
};

export function Box({
  padding,
  paddingHorizontal,
  paddingVertical,
  gap,
  direction,
  align,
  justify,
  flex,
  background,
  borderColor,
  radius,
  style,
  ...viewProperties
}: BoxProperties) {
  const theme = useTheme();

  return (
    <View
      style={[
        {
          padding: padding ? theme.spacing[padding] : undefined,
          paddingHorizontal: paddingHorizontal ? theme.spacing[paddingHorizontal] : undefined,
          paddingVertical: paddingVertical ? theme.spacing[paddingVertical] : undefined,
          gap: gap ? theme.spacing[gap] : undefined,
          flexDirection: direction,
          alignItems: align,
          justifyContent: justify,
          flex,
          backgroundColor: background ? theme.colors[background] : undefined,
          borderColor: borderColor ? theme.colors[borderColor] : undefined,
          borderWidth: borderColor ? 1 : undefined,
          borderRadius: radius ? theme.radii[radius] : undefined,
        },
        style,
      ]}
      {...viewProperties}
    />
  );
}
