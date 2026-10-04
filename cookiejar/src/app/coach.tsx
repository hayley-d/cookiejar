import { NuggieImage } from '@/components/atoms/NuggieImage';
import { Box } from '@/components/primitives/Box';
import { Typography } from '@/components/primitives/Typography';

export default function CoachScreen() {
  return (
    <Box flex={1} background="background" align="center" justify="center" gap="medium" padding="large">
      <NuggieImage name="coach" size={180} />
      <Typography variant="title" align="center">
        Coach Nuggie is warming up
      </Typography>
      <Typography color="textSecondary" align="center">
        Your coach arrives in phase 09.
      </Typography>
    </Box>
  );
}
