import { Box } from '@/components/primitives/Box';
import { Icon } from '@/components/primitives/Icon';
import { Touchable } from '@/components/primitives/Touchable';
import { Typography } from '@/components/primitives/Typography';
import { useTheme } from '@/theme/useTheme';

type MenuFieldProperties = {
  value: string;
  accessibilityLabel: string;
  onPress: () => void;
};

export function MenuField({ value, accessibilityLabel, onPress }: MenuFieldProperties) {
  const theme = useTheme();

  return (
    <Touchable
      onPress={onPress}
      accessibilityLabel={`${accessibilityLabel}, ${value}`}
      style={{
        backgroundColor: theme.colors.surface,
        borderColor: theme.colors.border,
        borderWidth: 1,
        borderRadius: theme.radii.medium,
        paddingHorizontal: theme.spacing.small,
        paddingVertical: theme.spacing.small + theme.spacing.extraSmall,
      }}
    >
      <Box direction="row" align="center" gap="extraSmall">
        <Box flex={1}>
          <Typography variant="label" numberOfLines={1}>
            {value}
          </Typography>
        </Box>
        <Icon name="chevron.down" size={theme.sizes.menuFieldChevron} color="textSecondary" weight="semibold" />
      </Box>
    </Touchable>
  );
}
