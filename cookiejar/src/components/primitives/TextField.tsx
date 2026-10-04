import { TextInput, type TextInputProps } from 'react-native';

import { useTheme } from '@/theme/useTheme';

export function TextField({ style, ...textInputProperties }: TextInputProps) {
  const theme = useTheme();

  return (
    <TextInput
      placeholderTextColor={theme.colors.textSecondary}
      selectionColor={theme.colors.accent}
      style={[
        theme.typography.label,
        {
          color: theme.colors.textPrimary,
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderWidth: 1,
          borderRadius: theme.radii.medium,
          paddingHorizontal: theme.spacing.medium,
          paddingVertical: theme.spacing.small + theme.spacing.extraSmall,
        },
        style,
      ]}
      {...textInputProperties}
    />
  );
}
