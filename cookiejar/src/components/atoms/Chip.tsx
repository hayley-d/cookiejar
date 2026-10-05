import { NuggieImage } from '@/components/atoms/NuggieImage';
import { Stack } from '@/components/primitives/Stack';
import { Touchable } from '@/components/primitives/Touchable';
import { Typography } from '@/components/primitives/Typography';
import type { NuggieName } from '@/nuggies/NuggieName';
import { useTheme } from '@/theme/useTheme';

type ChipProperties = {
  label: string;
  isSelected: boolean;
  onPress: () => void;
  nuggie?: NuggieName;
};

const nuggieSize = 32;

export function Chip({ label, isSelected, onPress, nuggie }: ChipProperties) {
  const theme = useTheme();

  return (
    <Touchable
      onPress={onPress}
      accessibilityLabel={label}
      accessibilityState={{ selected: isSelected }}
      style={{
        paddingVertical: nuggie ? theme.spacing.extraSmall : theme.spacing.small,
        paddingLeft: nuggie ? theme.spacing.extraSmall : theme.spacing.medium,
        paddingRight: theme.spacing.medium,
        borderRadius: theme.radii.round,
        borderWidth: 1,
        borderColor: isSelected ? theme.colors.accent : theme.colors.border,
        backgroundColor: isSelected ? theme.colors.accent : theme.colors.surface,
      }}
    >
      <Stack direction="horizontal" gap="small" align="center">
        {nuggie ? <NuggieImage name={nuggie} size={nuggieSize} /> : null}
        <Typography variant="label" color={isSelected ? 'onAccent' : 'textPrimary'}>
          {label}
        </Typography>
      </Stack>
    </Touchable>
  );
}
