import type { ReactNode } from 'react';

import { Box } from '@/components/primitives/Box';
import { Typography } from '@/components/primitives/Typography';

type ScreenHeaderProperties = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
};

export function ScreenHeader({ title, subtitle, action }: ScreenHeaderProperties) {
  return (
    <Box background="background" paddingHorizontal="medium" paddingVertical="medium" gap="extraSmall">
      <Box direction="row" align="center" justify="space-between" gap="small">
        <Typography variant="display">{title}</Typography>
        {action}
      </Box>
      {subtitle ? <Typography color="textSecondary">{subtitle}</Typography> : null}
    </Box>
  );
}
