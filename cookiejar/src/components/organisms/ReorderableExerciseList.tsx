import * as Haptics from 'expo-haptics';
import { Fragment, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { DragHandle } from '@/components/atoms/DragHandle';
import { AnimatedBox } from '@/components/primitives/AnimatedBox';
import { Box } from '@/components/primitives/Box';
import { Icon } from '@/components/primitives/Icon';
import { ScrollBox } from '@/components/primitives/ScrollBox';
import { Typography } from '@/components/primitives/Typography';
import { WindowMeasuredBox, type WindowFrame } from '@/components/primitives/WindowMeasuredBox';
import { useTheme } from '@/theme/useTheme';
import { moveBlockKey, type ItemBlock } from '@/workouts/groupIntoBlocks';
import {
  autoScrolledOffset,
  dragViewportPosition,
  targetSlotIndex,
  type ReorderDragPointer,
} from '@/workouts/reorderDrag';
import type { EditorItem } from '@/workouts/workoutEditorReducer';

type ReorderableExerciseListProperties = {
  blocks: ItemBlock<EditorItem>[];
  onReorder: (blockKeys: string[]) => void;
  onDraggingChange: (isDragging: boolean) => void;
  renderItem: (item: EditorItem, itemIndex: number, dragHandle: ReactNode) => ReactNode;
};

type ActiveDrag = ReorderDragPointer & {
  blockKey: string;
};

function describeBlock(block: ItemBlock<EditorItem>) {
  const exerciseNames = block.items.map((item) => item.exercise.name).join(' + ');
  return block.supersetGroup === null ? exerciseNames : `${block.supersetGroup} · ${exerciseNames}`;
}

export function ReorderableExerciseList({
  blocks,
  onReorder,
  onDraggingChange,
  renderItem,
}: ReorderableExerciseListProperties) {
  const theme = useTheme();
  const [viewportFrame, setViewportFrame] = useState<WindowFrame>({ top: 0, height: 0 });
  const [activeDrag, setActiveDrag] = useState<ActiveDrag | null>(null);
  const finishedDragReference = useRef<{ drag: ActiveDrag; viewportTop: number } | null>(null);
  const rowHeight = theme.sizes.reorderRow;
  const rowCount = blocks.length;
  const isDragging = activeDrag !== null;
  const { autoScrollEdge, autoScrollStep } = theme.sizes;
  const { autoScrollInterval } = theme.durations;
  const { top: viewportTop, height: viewportHeight } = viewportFrame;

  useEffect(() => {
    finishedDragReference.current = activeDrag === null ? null : { drag: activeDrag, viewportTop };
  }, [activeDrag, viewportTop]);

  useEffect(() => {
    if (!isDragging || viewportHeight === 0) {
      return;
    }
    const geometry = { rowHeight, rowCount, viewportHeight };
    const autoScroll = { edgeSize: autoScrollEdge, step: autoScrollStep };
    const autoScrollTimer = setInterval(() => {
      setActiveDrag((currentDrag) => {
        if (currentDrag === null) {
          return currentDrag;
        }
        const { pointerY, scrollOffset } = dragViewportPosition(currentDrag, viewportTop, rowHeight);
        const nextScrollOffset = autoScrolledOffset(scrollOffset, pointerY, geometry, autoScroll);
        return nextScrollOffset === scrollOffset
          ? currentDrag
          : { ...currentDrag, autoScrollDistance: currentDrag.autoScrollDistance + nextScrollOffset - scrollOffset };
      });
    }, autoScrollInterval);
    return () => clearInterval(autoScrollTimer);
  }, [isDragging, rowHeight, rowCount, viewportTop, viewportHeight, autoScrollEdge, autoScrollStep, autoScrollInterval]);

  const listedItems = useMemo(() => {
    const blockKeys = blocks.map((block) => block.key);

    const moveBlock = (fromIndex: number, slotOffset: number) => {
      const nextBlockKeys = moveBlockKey(blockKeys, fromIndex, slotOffset);
      if (nextBlockKeys !== blockKeys) {
        onReorder(nextBlockKeys);
      }
    };

    const startDrag = (blockKey: string, fromIndex: number, pointerWindowY: number) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onDraggingChange(true);
      setActiveDrag({
        blockKey,
        fromIndex,
        startPointerWindowY: pointerWindowY,
        pointerWindowY,
        autoScrollDistance: 0,
      });
    };

    const movePointer = (pointerWindowY: number) => {
      setActiveDrag((currentDrag) =>
        currentDrag === null || currentDrag.pointerWindowY === pointerWindowY
          ? currentDrag
          : { ...currentDrag, pointerWindowY },
      );
    };

    const endDrag = (didComplete: boolean) => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      const finishedDrag = finishedDragReference.current;
      setActiveDrag(null);
      onDraggingChange(false);
      if (!didComplete || finishedDrag === null) {
        return;
      }
      const { drag, viewportTop: finishedViewportTop } = finishedDrag;
      const { pointerY, scrollOffset } = dragViewportPosition(drag, finishedViewportTop, rowHeight);
      const targetIndex = targetSlotIndex(scrollOffset, pointerY, { rowHeight, rowCount: blockKeys.length });
      moveBlock(drag.fromIndex, targetIndex - drag.fromIndex);
    };

    const blockEntries = blocks.flatMap((block, blockIndex) =>
      block.items.map((item) => ({ item, blockKey: block.key, blockIndex })),
    );

    return blockEntries.map(({ item, blockKey, blockIndex }, itemIndex) => (
      <Fragment key={item.key}>
        {renderItem(
          item,
          itemIndex,
          <DragHandle
            accessibilityLabel={`Reorder ${item.exercise.name}`}
            onDragStart={(pointerWindowY) => startDrag(blockKey, blockIndex, pointerWindowY)}
            onDragMove={movePointer}
            onDragEnd={endDrag}
            onMove={(slotOffset) => moveBlock(blockIndex, slotOffset)}
          />,
        )}
      </Fragment>
    ));
  }, [blocks, onReorder, onDraggingChange, renderItem, rowHeight]);

  const dragPosition = activeDrag === null ? null : dragViewportPosition(activeDrag, viewportTop, rowHeight);
  const blocksByKey = new Map(blocks.map((block) => [block.key, block]));
  const previewBlocks =
    activeDrag === null || dragPosition === null
      ? []
      : moveBlockKey(
          blocks.map((block) => block.key),
          activeDrag.fromIndex,
          targetSlotIndex(dragPosition.scrollOffset, dragPosition.pointerY, { rowHeight, rowCount }) -
            activeDrag.fromIndex,
        ).flatMap((blockKey) => {
          const block = blocksByKey.get(blockKey);
          return block === undefined ? [] : [block];
        });

  return (
    <Box flex={1}>
      <ScrollBox automaticallyAdjustKeyboardInsets scrollEnabled={!isDragging}>
        {listedItems}
      </ScrollBox>
      {activeDrag === null || dragPosition === null ? null : (
        <WindowMeasuredBox
          onMeasure={setViewportFrame}
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            overflow: 'hidden',
            paddingHorizontal: theme.spacing.medium,
            backgroundColor: theme.colors.background,
          }}
        >
          <Box style={{ transform: [{ translateY: -dragPosition.scrollOffset }] }}>
            {previewBlocks.map((block) => {
              const isDragged = block.key === activeDrag.blockKey;
              return (
                <AnimatedBox key={block.key} motion="reorder" style={{ height: rowHeight }}>
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
        </WindowMeasuredBox>
      )}
    </Box>
  );
}
