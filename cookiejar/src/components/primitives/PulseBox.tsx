import { useEffect } from 'react';
import type { ViewProps } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

type PulseBoxProperties = ViewProps & {
  pulseDuration: number;
  delay?: number;
};

const dimmedOpacity = 0.3;

export function PulseBox({ pulseDuration, delay = 0, style, ...viewProperties }: PulseBoxProperties) {
  const opacity = useSharedValue(dimmedOpacity);

  useEffect(() => {
    opacity.set(
      withDelay(
        delay,
        withRepeat(
          withSequence(
            withTiming(1, { duration: pulseDuration }),
            withTiming(dimmedOpacity, { duration: pulseDuration }),
          ),
          -1,
        ),
      ),
    );
    return () => cancelAnimation(opacity);
  }, [opacity, pulseDuration, delay]);

  const pulseStyle = useAnimatedStyle(() => ({ opacity: opacity.get() }));

  return <Animated.View style={[style, pulseStyle]} {...viewProperties} />;
}
