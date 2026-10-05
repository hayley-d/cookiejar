import { NuggieImage } from '@/components/atoms/NuggieImage';
import { Stack } from '@/components/primitives/Stack';
import { Typography } from '@/components/primitives/Typography';
import { chooseNuggie } from '@/nuggies/chooseNuggie';
import { useTheme } from '@/theme/useTheme';

export function RestDay() {
  const theme = useTheme();

  return (
    <Stack direction="horizontal" gap="medium" align="center" style={{ paddingHorizontal: theme.spacing.small }}>
      <NuggieImage name={chooseNuggie({ kind: 'restDay' }, new Date())} size={theme.sizes.restDayNuggie} />
      <Typography color="textSecondary">Rest day</Typography>
    </Stack>
  );
}
