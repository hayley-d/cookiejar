import { Card } from '@/components/atoms/Card';
import { NuggieImage } from '@/components/atoms/NuggieImage';
import { Box } from '@/components/primitives/Box';
import { Stack } from '@/components/primitives/Stack';
import { Touchable } from '@/components/primitives/Touchable';
import { Typography } from '@/components/primitives/Typography';
import type { NuggieName } from '@/nuggies/NuggieName';
import { useTheme } from '@/theme/useTheme';

type KindChoiceCardProperties = {
  title: string;
  description: string;
  nuggie: NuggieName;
  isSelected: boolean;
  onPress: () => void;
};

const nuggieSize = 72;
const selectedBorderWidth = 2;

export function KindChoiceCard({ title, description, nuggie, isSelected, onPress }: KindChoiceCardProperties) {
  const theme = useTheme();

  return (
    <Touchable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityLabel={title}
      accessibilityHint={description}
      accessibilityState={{ selected: isSelected }}
    >
      <Card
        style={{
          borderWidth: selectedBorderWidth,
          borderColor: isSelected ? theme.colors.accent : theme.colors.surface,
          backgroundColor: isSelected ? theme.colors.accentSoft : theme.colors.surface,
        }}
      >
        <Stack direction="horizontal" gap="medium" align="center">
          <NuggieImage name={nuggie} size={nuggieSize} />
          <Box flex={1} gap="extraSmall">
            <Typography variant="heading">{title}</Typography>
            <Typography color="textSecondary">{description}</Typography>
          </Box>
        </Stack>
      </Card>
    </Touchable>
  );
}
