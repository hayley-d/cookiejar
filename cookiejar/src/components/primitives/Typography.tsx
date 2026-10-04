import { Text, type TextProps } from 'react-native';

import type { ColorName, TypographyVariant } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

type TypographyProperties = TextProps & {
  variant?: TypographyVariant;
  color?: ColorName;
  align?: 'left' | 'center' | 'right';
};

export function Typography({
  variant = 'body',
  color = 'textPrimary',
  align,
  style,
  ...textProperties
}: TypographyProperties) {
  const theme = useTheme();

  return (
    <Text
      style={[theme.typography[variant], { color: theme.colors[color], textAlign: align }, style]}
      {...textProperties}
    />
  );
}
