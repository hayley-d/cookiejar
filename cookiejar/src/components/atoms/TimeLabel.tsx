import { Typography } from '@/components/primitives/Typography';
import { formatTimeOfDay } from '@/plans/timeOfDay';
import { useTheme } from '@/theme/useTheme';

type TimeLabelProperties = {
  timeOfDay: string;
};

export function TimeLabel({ timeOfDay }: TimeLabelProperties) {
  const theme = useTheme();

  return (
    <Typography
      variant="label"
      style={{ width: theme.sizes.timeLabelColumn, fontVariant: ['tabular-nums'] }}
    >
      {formatTimeOfDay(timeOfDay)}
    </Typography>
  );
}
