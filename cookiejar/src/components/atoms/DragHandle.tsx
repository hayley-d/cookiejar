import { Icon } from '@/components/primitives/Icon';
import { LongPressDragBox } from '@/components/primitives/LongPressDragBox';
import { useTheme } from '@/theme/useTheme';

type DragHandleProperties = {
  accessibilityLabel: string;
  slotHeight: number;
  onDragStart: () => void;
  onSlotOffsetChange: (slotOffset: number) => void;
  onDragEnd: (slotOffset: number) => void;
  onMove: (slotOffset: number) => void;
};

const moveUpAction = 'moveUp';
const moveDownAction = 'moveDown';

export function DragHandle({
  accessibilityLabel,
  slotHeight,
  onDragStart,
  onSlotOffsetChange,
  onDragEnd,
  onMove,
}: DragHandleProperties) {
  const theme = useTheme();

  return (
    <LongPressDragBox
      slotHeight={slotHeight}
      onDragStart={onDragStart}
      onSlotOffsetChange={onSlotOffsetChange}
      onDragEnd={onDragEnd}
      accessible
      accessibilityLabel={accessibilityLabel}
      accessibilityHint="Long-press and drag to reorder"
      accessibilityActions={[
        { name: moveUpAction, label: 'Move up' },
        { name: moveDownAction, label: 'Move down' },
      ]}
      onAccessibilityAction={(event) => onMove(event.nativeEvent.actionName === moveUpAction ? -1 : 1)}
      style={{ alignItems: 'center', paddingBottom: theme.spacing.small }}
    >
      <Icon name="line.3.horizontal" size={theme.sizes.dragHandleIcon} color="textSecondary" weight="semibold" />
    </LongPressDragBox>
  );
}
