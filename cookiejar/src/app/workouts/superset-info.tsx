import { NuggieImage } from '@/components/atoms/NuggieImage';
import { Box } from '@/components/primitives/Box';
import { Typography } from '@/components/primitives/Typography';
import { useTheme } from '@/theme/useTheme';

export default function SupersetInfoScreen() {
  const theme = useTheme();

  return (
    <Box align="center" gap="medium" padding="large">
      <NuggieImage name="coach" size={theme.sizes.supersetInfoNuggie} />
      <Box align="center" gap="small">
        <Typography variant="title" align="center">
          Supersets
        </Typography>
        <Typography color="textSecondary" align="center">
          Supersets save time — do A1 then A2 back to back, then rest
        </Typography>
      </Box>
    </Box>
  );
}
