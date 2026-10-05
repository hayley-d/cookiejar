import { useEffect, useState } from 'react';

import { Typography } from '@/components/primitives/Typography';
import { elapsedSecondsBetween } from '@/sessions/calculateSessionTotals';
import { formatElapsedTime } from '@/sessions/formatSessionValues';
import type { TypographyVariant } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';

type ElapsedTimerProperties = {
  startedAt: string;
  variant?: TypographyVariant;
};

export function ElapsedTimer({ startedAt, variant = 'label' }: ElapsedTimerProperties) {
  const theme = useTheme();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), theme.durations.timerTick);
    return () => clearInterval(interval);
  }, [theme.durations.timerTick]);

  const elapsedText = formatElapsedTime(elapsedSecondsBetween(startedAt, now));

  return (
    <Typography
      variant={variant}
      accessibilityRole="timer"
      accessibilityLabel={`Elapsed time ${elapsedText}`}
      style={{ fontVariant: ['tabular-nums'] }}
    >
      {elapsedText}
    </Typography>
  );
}
