import { View, type ViewProps } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { useTheme } from '@/theme/useTheme';

type LongPressDragBoxProperties = ViewProps & {
  onDragStart: (pointerWindowY: number) => void;
  onDragMove: (pointerWindowY: number) => void;
  onDragEnd: (didComplete: boolean) => void;
};

export function LongPressDragBox({ onDragStart, onDragMove, onDragEnd, ...viewProperties }: LongPressDragBoxProperties) {
  const theme = useTheme();

  const dragGesture = Gesture.Pan()
    .runOnJS(true)
    .activateAfterLongPress(theme.durations.dragLongPress)
    .onStart((event) => onDragStart(event.absoluteY))
    .onUpdate((event) => onDragMove(event.absoluteY))
    .onEnd((event, didComplete) => onDragEnd(didComplete));

  return (
    <GestureDetector gesture={dragGesture}>
      <View collapsable={false} {...viewProperties} />
    </GestureDetector>
  );
}
