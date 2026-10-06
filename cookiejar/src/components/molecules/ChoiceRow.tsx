import { Box } from '@/components/primitives/Box';
import { Icon } from '@/components/primitives/Icon';
import { Touchable } from '@/components/primitives/Touchable';
import { Typography } from '@/components/primitives/Typography';
import { useTheme } from '@/theme/useTheme';

type ChoiceRowProperties = {
  title: string;
  isSelected: boolean;
  onPress: () => void;
};

const checkmarkSize = 16;

export function ChoiceRow({ title, isSelected, onPress }: ChoiceRowProperties) {
  const theme = useTheme();

  return (
    <Touchable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityLabel={title}
      accessibilityState={{ selected: isSelected }}
    >
      <Box
        direction="row"
        align="center"
        justify="space-between"
        gap="medium"
        paddingVertical="medium"
        style={{ borderBottomWidth: theme.sizes.rowDividerWidth, borderBottomColor: theme.colors.border }}
      >
        <Typography variant="label">{title}</Typography>
        {isSelected ? <Icon name="checkmark" size={checkmarkSize} color="accent" weight="semibold" /> : null}
      </Box>
    </Touchable>
  );
}
