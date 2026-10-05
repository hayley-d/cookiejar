import { Button } from '@/components/atoms/Button';
import { Card } from '@/components/atoms/Card';
import { NuggieImage } from '@/components/atoms/NuggieImage';
import { Box } from '@/components/primitives/Box';
import { Stack } from '@/components/primitives/Stack';
import { Typography } from '@/components/primitives/Typography';
import { chooseNuggie } from '@/nuggies/chooseNuggie';
import { useTheme } from '@/theme/useTheme';

type NoPlanCardProperties = {
  onCreatePlan: () => void;
};

export function NoPlanCard({ onCreatePlan }: NoPlanCardProperties) {
  const theme = useTheme();
  const now = new Date();

  return (
    <Card>
      <Stack gap="medium">
        <Stack direction="horizontal" gap="medium" align="center">
          <NuggieImage
            name={chooseNuggie({ kind: 'coach' }, now)}
            size={theme.sizes.healthPermissionNuggie}
          />
          <Box flex={1} gap="extraSmall">
            <Typography variant="heading">Let&apos;s make a plan!</Typography>
          </Box>
        </Stack>
        <Button label="Create plan" onPress={onCreatePlan} />
      </Stack>
    </Card>
  );
}
