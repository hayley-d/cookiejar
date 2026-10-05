import { Badge } from '@/components/atoms/Badge';
import { Card } from '@/components/atoms/Card';
import { Box } from '@/components/primitives/Box';
import { Icon } from '@/components/primitives/Icon';
import { Stack } from '@/components/primitives/Stack';
import { Touchable } from '@/components/primitives/Touchable';
import { Typography } from '@/components/primitives/Typography';
import { useTheme } from '@/theme/useTheme';

type PlanRowProperties = {
  name: string;
  summary: string;
  isActive: boolean;
  onPress: () => void;
};

export function PlanRow({ name, summary, isActive, onPress }: PlanRowProperties) {
  const theme = useTheme();

  return (
    <Touchable
      onPress={onPress}
      accessibilityLabel={isActive ? `${name}, active plan, ${summary}` : `${name}, ${summary}`}
    >
      <Card>
        <Stack direction="horizontal" gap="medium" align="center">
          <Box flex={1} gap="extraSmall">
            <Typography variant="label">{name}</Typography>
            {isActive ? <Badge label="ACTIVE" /> : null}
            <Typography variant="caption" color="textSecondary">
              {summary}
            </Typography>
          </Box>
          <Icon name="chevron.right" size={theme.sizes.planRowChevron} color="textSecondary" weight="semibold" />
        </Stack>
      </Card>
    </Touchable>
  );
}
