import { Button } from '@/components/atoms/Button';
import { Card } from '@/components/atoms/Card';
import { NuggieImage } from '@/components/atoms/NuggieImage';
import { Box } from '@/components/primitives/Box';
import { Stack } from '@/components/primitives/Stack';
import { Typography } from '@/components/primitives/Typography';
import { useTheme } from '@/theme/useTheme';

type HealthPermissionCardProperties = {
  onConnect: () => void;
  isConnecting?: boolean;
};

export function HealthPermissionCard({ onConnect, isConnecting = false }: HealthPermissionCardProperties) {
  const theme = useTheme();

  return (
    <Card>
      <Stack gap="medium">
        <Stack direction="horizontal" gap="medium" align="center">
          <NuggieImage name="coach" size={theme.sizes.healthPermissionNuggie} />
          <Box flex={1} gap="extraSmall">
            <Typography variant="heading">Connect Apple Health</Typography>
            <Typography color="textSecondary">
              I can show your steps, sleep and resting heart rate here. Garmin Connect shares them through Apple Health,
              and everything stays on your phone.
            </Typography>
          </Box>
        </Stack>
        <Button label="Connect" onPress={onConnect} disabled={isConnecting} />
      </Stack>
    </Card>
  );
}
