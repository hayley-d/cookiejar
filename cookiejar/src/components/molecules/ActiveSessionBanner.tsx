import { useEffect, useState } from 'react';

import { Touchable } from '@/components/primitives/Touchable';
import { Typography } from '@/components/primitives/Typography';
import { describeActiveSessionBanner } from '@/sessions/describeActiveSessionBanner';
import { useTheme } from '@/theme/useTheme';

type ActiveSessionBannerProperties = {
  startedAt: string;
  onPress: () => void;
};

export function ActiveSessionBanner({ startedAt, onPress }: ActiveSessionBannerProperties) {
  const theme = useTheme();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), theme.durations.bannerRefresh);
    return () => clearInterval(interval);
  }, [startedAt, theme.durations.bannerRefresh]);

  const description = describeActiveSessionBanner(startedAt, now);

  return (
    <Touchable
      onPress={onPress}
      accessibilityLabel={description}
      style={[
        {
          height: theme.sizes.coachButton,
          justifyContent: 'center',
          paddingHorizontal: theme.spacing.medium,
          borderRadius: theme.radii.large,
          backgroundColor: theme.colors.accent,
        },
        theme.shadows.card,
      ]}
    >
      <Typography variant="label" color="onAccent" numberOfLines={2}>
        {description}
      </Typography>
    </Touchable>
  );
}
