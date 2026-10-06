import type { ReactNode } from 'react';

import { Box } from '@/components/primitives/Box';
import { Typography } from '@/components/primitives/Typography';
import { formatFullDate } from '@/dates/formatFullDate';
import { toLocalDateString } from '@/dates/toLocalDateString';
import { chooseGreeting } from '@/home/chooseGreeting';

type GreetingHeaderProperties = {
  displayName: string | null;
  now: Date;
  accessory?: ReactNode;
};

export function GreetingHeader({ displayName, now, accessory }: GreetingHeaderProperties) {
  return (
    <Box background="background" direction="row" align="flex-start" justify="space-between" gap="small">
      <Box flex={1} gap="extraSmall">
        <Typography variant="display">{chooseGreeting(now, displayName)}</Typography>
        <Typography color="textSecondary">{formatFullDate(toLocalDateString(now))}</Typography>
      </Box>
      {accessory}
    </Box>
  );
}
