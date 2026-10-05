import type { SFSymbol } from 'expo-symbols';

import { Card } from '@/components/atoms/Card';
import { Icon } from '@/components/primitives/Icon';
import { Stack } from '@/components/primitives/Stack';
import { Touchable } from '@/components/primitives/Touchable';
import { Typography } from '@/components/primitives/Typography';
import { useTheme } from '@/theme/useTheme';

type ActionCardProperties = {
  title: string;
  icon: SFSymbol;
  onPress: () => void;
};

const iconSize = 32;

export function ActionCard({ title, icon, onPress }: ActionCardProperties) {
  const theme = useTheme();

  return (
    <Touchable onPress={onPress} accessibilityLabel={title}>
      <Card padding="large" style={{ backgroundColor: theme.colors.accent }}>
        <Stack direction="horizontal" gap="medium" align="center">
          <Icon name={icon} size={iconSize} color="onAccent" weight="semibold" />
          <Typography variant="title" color="onAccent">
            {title}
          </Typography>
        </Stack>
      </Card>
    </Touchable>
  );
}
