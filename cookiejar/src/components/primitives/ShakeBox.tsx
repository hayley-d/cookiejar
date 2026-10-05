import { useEffect } from 'react';
import type { ViewProps } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';

import { useTheme } from '@/theme/useTheme';

type ShakeBoxProperties = ViewProps & {
  shakeCount: number;
};

export function ShakeBox({ shakeCount, style, ...viewProperties }: ShakeBoxProperties) {
  const theme = useTheme();
  const horizontalOffset = useSharedValue(0);
  const { shakeDistance } = theme.sizes;
  const { shakeStep } = theme.durations;

  useEffect(() => {
    if (shakeCount === 0) {
      return;
    }
    horizontalOffset.set(
      withSequence(
        withTiming(-shakeDistance, { duration: shakeStep }),
        withTiming(shakeDistance, { duration: shakeStep }),
        withTiming(-shakeDistance, { duration: shakeStep }),
        withTiming(shakeDistance, { duration: shakeStep }),
        withTiming(0, { duration: shakeStep }),
      ),
    );
  }, [shakeCount, horizontalOffset, shakeDistance, shakeStep]);

  const shakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: horizontalOffset.get() }] }));

  return <Animated.View style={[style, shakeStyle]} {...viewProperties} />;
}
