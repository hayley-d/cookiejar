import { Touchable } from '@/components/primitives/Touchable';
import { Typography } from '@/components/primitives/Typography';
import { useTheme } from '@/theme/useTheme';

type PromptChipProperties = {
  label: string;
  onPress: () => void;
  disabled: boolean;
};

export function PromptChip({ label, onPress, disabled }: PromptChipProperties) {
  const theme = useTheme();

  return (
    <Touchable
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      style={{
        paddingVertical: theme.spacing.small,
        paddingHorizontal: theme.spacing.medium,
        borderRadius: theme.radii.round,
        borderWidth: 1,
        borderColor: theme.colors.accent,
        backgroundColor: theme.colors.surface,
      }}
    >
      <Typography variant="label">{label}</Typography>
    </Touchable>
  );
}
