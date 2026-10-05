import { Box } from '@/components/primitives/Box';
import { Typography } from '@/components/primitives/Typography';
import { formatFullDate } from '@/dates/formatFullDate';
import { toLocalDateString } from '@/dates/toLocalDateString';
import { chooseGreeting } from '@/home/chooseGreeting';

type GreetingHeaderProperties = {
  displayName: string | null;
  now: Date;
};

export function GreetingHeader({ displayName, now }: GreetingHeaderProperties) {
  return (
    <Box background="background" gap="extraSmall">
      <Typography variant="display">{chooseGreeting(now, displayName)}</Typography>
      <Typography color="textSecondary">{formatFullDate(toLocalDateString(now))}</Typography>
    </Box>
  );
}
