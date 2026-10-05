import { Button } from '@/components/atoms/Button';
import { Card } from '@/components/atoms/Card';
import { Icon } from '@/components/primitives/Icon';
import { Stack } from '@/components/primitives/Stack';
import { Touchable } from '@/components/primitives/Touchable';
import { Typography } from '@/components/primitives/Typography';
import { describeActiveSince } from '@/plans/describeActiveSince';
import { useTheme } from '@/theme/useTheme';

type ActivePlanBannerProperties = {
  startsOn: string | null;
  onOpenActions: () => void;
  onMakeActive: () => void;
};

export function ActivePlanBanner({ startsOn, onOpenActions, onMakeActive }: ActivePlanBannerProperties) {
  const theme = useTheme();

  if (startsOn === null) {
    return <Button label="Make active" onPress={onMakeActive} />;
  }

  const description = describeActiveSince(startsOn);

  return (
    <Touchable onPress={onOpenActions} accessibilityLabel={`${description}. Plan options`}>
      <Card>
        <Stack direction="horizontal" gap="medium" align="center" justify="space-between">
          <Typography variant="label">{description}</Typography>
          <Icon name="chevron.down" size={theme.sizes.planRowChevron} color="textSecondary" weight="semibold" />
        </Stack>
      </Card>
    </Touchable>
  );
}
