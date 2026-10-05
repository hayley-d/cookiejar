import { useEffect, useRef, useState } from 'react';

import { Box } from '@/components/primitives/Box';
import { Icon } from '@/components/primitives/Icon';
import { Touchable } from '@/components/primitives/Touchable';
import { Typography } from '@/components/primitives/Typography';
import { formatDuration } from '@/dates/formatDuration';
import {
  displayedCountdownSeconds,
  elapsedSecondsSince,
  hasCountdownFinished,
  planCountdown,
  recordedCountdownSeconds,
  type CountdownPlan,
} from '@/sessions/countdownProgress';
import { useTheme } from '@/theme/useTheme';

type CountdownButtonProperties = {
  targetSeconds: number | null;
  accessibilityLabel: string;
  onFinish: (elapsedSeconds: number) => void;
};

type CountdownRun = {
  plan: CountdownPlan;
  startedAtMilliseconds: number;
};

export function CountdownButton({ targetSeconds, accessibilityLabel, onFinish }: CountdownButtonProperties) {
  const theme = useTheme();
  const [run, setRun] = useState<CountdownRun | null>(null);
  const [nowMilliseconds, setNowMilliseconds] = useState(0);
  const onFinishReference = useRef(onFinish);

  useEffect(() => {
    onFinishReference.current = onFinish;
  });

  useEffect(() => {
    if (run === null) {
      return;
    }
    const interval = setInterval(() => {
      const currentMilliseconds = Date.now();
      const elapsedSeconds = elapsedSecondsSince(run.startedAtMilliseconds, currentMilliseconds);
      if (hasCountdownFinished(run.plan, elapsedSeconds)) {
        setRun(null);
        onFinishReference.current(recordedCountdownSeconds(run.plan, elapsedSeconds));
        return;
      }
      setNowMilliseconds(currentMilliseconds);
    }, theme.durations.fastTimerTick);
    return () => clearInterval(interval);
  }, [run, theme.durations.fastTimerTick]);

  const start = () => {
    const startedAtMilliseconds = Date.now();
    setNowMilliseconds(startedAtMilliseconds);
    setRun({ plan: planCountdown(targetSeconds), startedAtMilliseconds });
  };

  const stop = () => {
    if (run === null) {
      return;
    }
    const elapsedSeconds = elapsedSecondsSince(run.startedAtMilliseconds, Date.now());
    setRun(null);
    onFinish(recordedCountdownSeconds(run.plan, elapsedSeconds));
  };

  const isRunning = run !== null;
  const displayedSeconds =
    run === null
      ? 0
      : displayedCountdownSeconds(run.plan, elapsedSecondsSince(run.startedAtMilliseconds, nowMilliseconds));

  return (
    <Touchable
      onPress={isRunning ? stop : start}
      accessibilityLabel={isRunning ? `Stop ${accessibilityLabel}` : `Start ${accessibilityLabel}`}
      style={{ minWidth: theme.sizes.countdownButtonHeight, height: theme.sizes.countdownButtonHeight }}
    >
      <Box
        direction="row"
        align="center"
        justify="center"
        gap="extraSmall"
        paddingHorizontal="small"
        radius="round"
        background="accentSoft"
        style={{ minHeight: theme.sizes.countdownButtonHeight }}
      >
        <Icon name={isRunning ? 'stop.fill' : 'play.fill'} size={theme.sizes.countdownButtonIcon} color="accent" />
        {isRunning ? (
          <Typography variant="label" color="accent" style={{ fontVariant: ['tabular-nums'] }}>
            {formatDuration(displayedSeconds)}
          </Typography>
        ) : null}
      </Box>
    </Touchable>
  );
}
