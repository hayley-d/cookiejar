import { NuggieImage } from '@/components/atoms/NuggieImage';
import { Box } from '@/components/primitives/Box';
import { Typography } from '@/components/primitives/Typography';

const nuggieSize = 140;

export default function SupersetInfoScreen() {
  return (
    <Box align="center" gap="medium" padding="large">
      <NuggieImage name="coach" size={nuggieSize} />
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
