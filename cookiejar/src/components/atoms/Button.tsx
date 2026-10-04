import { Touchable } from '@/components/primitives/Touchable';
import { Typography } from '@/components/primitives/Typography';
import { useTheme } from '@/theme/useTheme';

type ButtonVariant = 'primary' | 'secondary';

type ButtonProperties = {
  label: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
};

export function Button({ label, onPress, variant = 'primary', disabled }: ButtonProperties) {
  const theme = useTheme();
  const isPrimary = variant === 'primary';

  return (
    <Touchable
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={label}
      style={{
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: theme.spacing.small + theme.spacing.extraSmall,
        paddingHorizontal: theme.spacing.large,
        borderRadius: theme.radii.round,
        backgroundColor: isPrimary ? theme.colors.accent : 'transparent',
        borderWidth: isPrimary ? 0 : 1,
        borderColor: theme.colors.border,
      }}
    >
      <Typography variant="label" color={isPrimary ? 'onAccent' : 'textPrimary'}>
        {label}
      </Typography>
    </Touchable>
  );
}
