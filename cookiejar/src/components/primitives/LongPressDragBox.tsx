import { View, type ViewProps } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

import { useTheme } from '@/theme/useTheme';

type LongPressDragBoxProperties = ViewProps & {
  slotHeight: number;
  onDragStart: () => void;
  onSlotOffsetChange: (slotOffset: number) => void;
  onDragEnd: (slotOffset: number) => void;
};

export function LongPressDragBox({
  slotHeight,
  onDragStart,
  onSlotOffsetChange,
  onDragEnd,
  ...viewProperties
}: LongPressDragBoxProperties) {
  const theme = useTheme();
  const toSlotOffset = (translationY: number) => Math.round(translationY / slotHeight);

  const dragGesture = Gesture.Pan()
    .runOnJS(true)
    .activateAfterLongPress(theme.durations.dragLongPress)
    .onStart(() => onDragStart())
    .onUpdate((event) => onSlotOffsetChange(toSlotOffset(event.translationY)))
    .onEnd((event, didSucceed) => onDragEnd(didSucceed ? toSlotOffset(event.translationY) : 0));

  return (
    <GestureDetector gesture={dragGesture}>
      <View collapsable={false} {...viewProperties} />
    </GestureDetector>
  );
}
