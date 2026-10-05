import type { ViewProps } from 'react-native';
import Animated, { FadeInDown, FadeOutDown, LinearTransition } from 'react-native-reanimated';

type AnimatedBoxMotion = 'rise' | 'reorder';

type AnimatedBoxProperties = ViewProps & {
  motion: AnimatedBoxMotion;
};

const motionAnimations = {
  rise: { entering: FadeInDown, exiting: FadeOutDown, layout: undefined },
  reorder: { entering: undefined, exiting: undefined, layout: LinearTransition },
};

export function AnimatedBox({ motion, ...viewProperties }: AnimatedBoxProperties) {
  const { entering, exiting, layout } = motionAnimations[motion];

  return <Animated.View entering={entering} exiting={exiting} layout={layout} {...viewProperties} />;
}
