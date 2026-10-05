import { useEffect } from 'react';

import { AnimatedBox } from '@/components/primitives/AnimatedBox';
import { Icon } from '@/components/primitives/Icon';
import { Stack } from '@/components/primitives/Stack';
import { Typography } from '@/components/primitives/Typography';
import { useTheme } from '@/theme/useTheme';

type ToastProperties = {
  message: string;
  onDismiss: () => void;
};

const visibleMilliseconds = 2500;

export function Toast({ message, onDismiss }: ToastProperties) {
  const theme = useTheme();

  useEffect(() => {
    const timeout = setTimeout(onDismiss, visibleMilliseconds);
    return () => clearTimeout(timeout);
  }, [onDismiss]);

  return (
    <AnimatedBox
      motion="rise"
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={[
        {
          alignSelf: 'center',
          backgroundColor: theme.colors.accent,
          borderRadius: theme.radii.round,
          paddingHorizontal: theme.spacing.medium,
          paddingVertical: theme.sizes.toastVerticalPadding,
        },
        theme.shadows.card,
      ]}
    >
      <Stack direction="horizontal" gap="small" align="center">
        <Icon name="checkmark.circle.fill" size={theme.sizes.toastIcon} color="onAccent" />
        <Typography variant="label" color="onAccent">
          {message}
        </Typography>
      </Stack>
    </AnimatedBox>
  );
}
