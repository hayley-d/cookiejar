import * as Haptics from 'expo-haptics';
import { Fragment, useState, type ReactNode } from 'react';

import { DragHandle } from '@/components/atoms/DragHandle';
import { AnimatedBox } from '@/components/primitives/AnimatedBox';
import { Box } from '@/components/primitives/Box';
import { Icon } from '@/components/primitives/Icon';
import { ScrollBox } from '@/components/primitives/ScrollBox';
import { Typography } from '@/components/primitives/Typography';
import { useTheme } from '@/theme/useTheme';
import { moveBlockKey, type ItemBlock } from '@/workouts/groupIntoBlocks';
import type { EditorItem } from '@/workouts/workoutEditorReducer';

type ReorderableExerciseListProperties = {
  blocks: ItemBlock<EditorItem>[];
  onReorder: (blockKeys: string[]) => void;
  renderItem: (item: EditorItem, itemIndex: number, dragHandle: ReactNode) => ReactNode;
};

type ActiveDrag = {
  blockKey: string;
  slotOffset: number;
};

function describeBlock(block: ItemBlock<EditorItem>) {
  const exerciseNames = block.items.map((item) => item.exercise.name).join(' + ');
  return block.supersetGroup === null ? exerciseNames : `${block.supersetGroup} · ${exerciseNames}`;
}

export function ReorderableExerciseList({ blocks, onReorder, renderItem }: ReorderableExerciseListProperties) {
  const theme = useTheme();
  const [activeDrag, setActiveDrag] = useState<ActiveDrag | null>(null);
  const blockKeys = blocks.map((block) => block.key);
  const blocksByKey = new Map(blocks.map((block) => [block.key, block]));
  const slotHeight = theme.sizes.reorderRow;

  const reorderedBlockKeys = (blockKey: string, slotOffset: number) =>
    moveBlockKey(blockKeys, blockKeys.indexOf(blockKey), slotOffset);

  const moveBlock = (blockKey: string, slotOffset: number) => {
    const nextBlockKeys = reorderedBlockKeys(blockKey, slotOffset);
    if (nextBlockKeys !== blockKeys) {
      onReorder(nextBlockKeys);
    }
  };

  const startDrag = (blockKey: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveDrag({ blockKey, slotOffset: 0 });
  };

  const changeSlotOffset = (slotOffset: number) => {
    setActiveDrag((currentDrag) =>
      currentDrag === null || currentDrag.slotOffset === slotOffset ? currentDrag : { ...currentDrag, slotOffset },
    );
  };

  const endDrag = (blockKey: string, slotOffset: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setActiveDrag(null);
    moveBlock(blockKey, slotOffset);
  };

  const itemsWithBlockKeys = blocks.flatMap((block) => block.items.map((item) => ({ item, blockKey: block.key })));
  const previewBlocks =
    activeDrag === null
      ? []
      : reorderedBlockKeys(activeDrag.blockKey, activeDrag.slotOffset).flatMap((blockKey) => {
          const block = blocksByKey.get(blockKey);
          return block === undefined ? [] : [block];
        });

  return (
    <Box flex={1}>
      <ScrollBox automaticallyAdjustKeyboardInsets scrollEnabled={activeDrag === null}>
        {itemsWithBlockKeys.map(({ item, blockKey }, itemIndex) => (
          <Fragment key={item.key}>
            {renderItem(
              item,
              itemIndex,
              <DragHandle
                accessibilityLabel={`Reorder ${item.exercise.name}`}
                slotHeight={slotHeight}
                onDragStart={() => startDrag(blockKey)}
                onSlotOffsetChange={changeSlotOffset}
                onDragEnd={(slotOffset) => endDrag(blockKey, slotOffset)}
                onMove={(slotOffset) => moveBlock(blockKey, slotOffset)}
              />,
            )}
          </Fragment>
        ))}
      </ScrollBox>
      {activeDrag === null ? null : (
        <Box
          background="background"
          padding="medium"
          pointerEvents="none"
          style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, overflow: 'hidden' }}
        >
          {previewBlocks.map((block) => {
            const isDragged = block.key === activeDrag.blockKey;
            return (
              <AnimatedBox key={block.key} motion="reorder" style={{ height: slotHeight }}>
                <Box
                  flex={1}
                  direction="row"
                  align="center"
                  gap="small"
                  paddingHorizontal="medium"
                  radius="medium"
                  background={isDragged ? 'accentSoft' : 'surface'}
                  borderColor={isDragged ? 'accent' : 'border'}
                  style={{ marginBottom: theme.spacing.small }}
                >
                  <Icon name="line.3.horizontal" size={theme.sizes.dragHandleIcon} color="textSecondary" />
                  <Box flex={1}>
                    <Typography variant="label" numberOfLines={1}>
                      {describeBlock(block)}
                    </Typography>
                  </Box>
                </Box>
              </AnimatedBox>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
