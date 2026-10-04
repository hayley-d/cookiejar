import { Touchable } from '@/components/primitives/Touchable';
import { Typography } from '@/components/primitives/Typography';
import { useTheme } from '@/theme/useTheme';

type ChipProperties = {
  label: string;
  isSelected: boolean;
  onPress: () => void;
};

export function Chip({ label, isSelected, onPress }: ChipProperties) {
  const theme = useTheme();

  return (
    <Touchable
      onPress={onPress}
      accessibilityLabel={label}
      accessibilityState={{ selected: isSelected }}
      style={{
        paddingVertical: theme.spacing.small,
        paddingHorizontal: theme.spacing.medium,
        borderRadius: theme.radii.round,
        borderWidth: 1,
        borderColor: isSelected ? theme.colors.accent : theme.colors.border,
        backgroundColor: isSelected ? theme.colors.accent : theme.colors.surface,
      }}
    >
      <Typography variant="label" color={isSelected ? 'onAccent' : 'textPrimary'}>
        {label}
      </Typography>
    </Touchable>
  );
}
