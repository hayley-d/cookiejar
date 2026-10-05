import type { ViewProps } from 'react-native';
import Animated, { FadeInDown, FadeOutDown } from 'react-native-reanimated';

type AnimatedBoxMotion = 'rise';

type AnimatedBoxProperties = ViewProps & {
  motion: AnimatedBoxMotion;
};

const motionAnimations = {
  rise: { entering: FadeInDown, exiting: FadeOutDown },
};

export function AnimatedBox({ motion, ...viewProperties }: AnimatedBoxProperties) {
  const { entering, exiting } = motionAnimations[motion];

  return <Animated.View entering={entering} exiting={exiting} {...viewProperties} />;
}
