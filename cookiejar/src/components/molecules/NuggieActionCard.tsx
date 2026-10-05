import { Button } from '@/components/atoms/Button';
import { Card } from '@/components/atoms/Card';
import { NuggieImage } from '@/components/atoms/NuggieImage';
import { Box } from '@/components/primitives/Box';
import { Stack } from '@/components/primitives/Stack';
import { Typography } from '@/components/primitives/Typography';
import type { NuggieName } from '@/nuggies/NuggieName';
import { useTheme } from '@/theme/useTheme';

type NuggieActionCardProperties = {
  nuggieName: NuggieName;
  title: string;
  message?: string;
  actionLabel: string;
  onAction: () => void;
  actionVariant?: 'primary' | 'secondary';
  isActionDisabled?: boolean;
};

export function NuggieActionCard({
  nuggieName,
  title,
  message,
  actionLabel,
  onAction,
  actionVariant,
  isActionDisabled,
}: NuggieActionCardProperties) {
  const theme = useTheme();

  return (
    <Card>
      <Stack gap="medium">
        <Stack direction="horizontal" gap="medium" align="center">
          <NuggieImage name={nuggieName} size={theme.sizes.healthPermissionNuggie} />
          <Box flex={1} gap={message ? 'extraSmall' : undefined}>
            <Typography variant="heading">{title}</Typography>
            {message ? <Typography color="textSecondary">{message}</Typography> : null}
          </Box>
        </Stack>
        <Button label={actionLabel} onPress={onAction} variant={actionVariant} disabled={isActionDisabled} />
      </Stack>
    </Card>
  );
}
