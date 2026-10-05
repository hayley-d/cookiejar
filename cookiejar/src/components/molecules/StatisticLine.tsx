import { Box } from '@/components/primitives/Box';
import { Typography } from '@/components/primitives/Typography';

type StatisticLineProperties = {
  label: string;
  value: string;
};

export function StatisticLine({ label, value }: StatisticLineProperties) {
  return (
    <Box direction="row" justify="space-between" accessible accessibilityLabel={`${label} ${value}`}>
      <Typography variant="body" color="textSecondary">
        {label}
      </Typography>
      <Typography variant="label">{value}</Typography>
    </Box>
  );
}
