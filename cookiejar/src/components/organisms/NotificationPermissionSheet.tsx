import { Button } from '@/components/atoms/Button';
import { NuggieImage } from '@/components/atoms/NuggieImage';
import { Box } from '@/components/primitives/Box';
import { Stack } from '@/components/primitives/Stack';
import { Typography } from '@/components/primitives/Typography';

type NotificationPermissionSheetProperties = {
  onContinue: () => void;
  onDismiss: () => void;
  isRequesting: boolean;
};

const nuggieSize = 120;

export function NotificationPermissionSheet({
  onContinue,
  onDismiss,
  isRequesting,
}: NotificationPermissionSheetProperties) {
  return (
    <Box padding="large">
      <Stack gap="medium" align="center">
        <NuggieImage name="notification" size={nuggieSize} />
        <Stack gap="small" align="center">
          <Typography variant="title" align="center">
            Nuggie wants to keep you posted
          </Typography>
          <Typography color="textSecondary" align="center">
            Nuggie will remind you before workouts, tell you when rest is up while your phone is locked, and send a
            Sunday wrap-up.
          </Typography>
        </Stack>
        <Stack gap="small">
          <Button label="Sounds noopy!" onPress={onContinue} disabled={isRequesting} />
          <Button label="Not now" onPress={onDismiss} variant="secondary" disabled={isRequesting} />
        </Stack>
      </Stack>
    </Box>
  );
}
