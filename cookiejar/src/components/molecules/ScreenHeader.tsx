import { Box } from '@/components/primitives/Box';
import { Typography } from '@/components/primitives/Typography';

type ScreenHeaderProperties = {
  title: string;
  subtitle?: string;
};

export function ScreenHeader({ title, subtitle }: ScreenHeaderProperties) {
  return (
    <Box background="background" paddingHorizontal="medium" paddingVertical="medium" gap="extraSmall">
      <Typography variant="display">{title}</Typography>
      {subtitle ? <Typography color="textSecondary">{subtitle}</Typography> : null}
    </Box>
  );
}
