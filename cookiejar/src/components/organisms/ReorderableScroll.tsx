import * as Haptics from 'expo-haptics';
import { useEffect, useRef, useState, type ReactNode } from 'react';

import { DragHandle } from '@/components/atoms/DragHandle';
import { AnimatedBox } from '@/components/primitives/AnimatedBox';
import { Box } from '@/components/primitives/Box';
import { Icon } from '@/components/primitives/Icon';
import { ScrollBox } from '@/components/primitives/ScrollBox';
import { Typography } from '@/components/primitives/Typography';
import { WindowMeasuredBox, type WindowFrame } from '@/components/primitives/WindowMeasuredBox';
import type { SpacingName } from '@/theme/tokens';
import { useTheme } from '@/theme/useTheme';
import { moveBlockKey } from '@/workouts/groupIntoBlocks';
import {
  autoScrolledOffset,
  dragViewportPosition,
  targetSlotIndex,
  type ReorderDragPointer,
} from '@/workouts/reorderDrag';

export type ReorderRow = {
  key: string;
  label: string;
};

export type ReorderRequest = {
  rows: ReorderRow[];
  fromIndex: number;
  onCommit: (rowKeys: string[]) => void;
};

export type RenderDragHandle = (accessibilityLabel: string, request: ReorderRequest) => ReactNode;

type ReorderableScrollProperties = {
  gap?: SpacingName;
  onDraggingChange?: (isDragging: boolean) => void;
  children: (renderDragHandle: RenderDragHandle) => ReactNode;
};

type ActiveDrag = ReorderDragPointer & ReorderRequest;

export function ReorderableScroll({ gap, onDraggingChange, children }: ReorderableScrollProperties) {
  const theme = useTheme();
  const [viewportFrame, setViewportFrame] = useState<WindowFrame>({ top: 0, height: 0 });
  const [activeDrag, setActiveDrag] = useState<ActiveDrag | null>(null);
  const finishedDragReference = useRef<{ drag: ActiveDrag; viewportTop: number } | null>(null);
  const rowHeight = theme.sizes.reorderRow;
  const rowCount = activeDrag?.rows.length ?? 0;
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

  const commitMove = (request: ReorderRequest, slotOffset: number) => {
    const rowKeys = request.rows.map((row) => row.key);
    const nextRowKeys = moveBlockKey(rowKeys, request.fromIndex, slotOffset);
    if (nextRowKeys !== rowKeys) {
      request.onCommit(nextRowKeys);
    }
  };

  const startDrag = (request: ReorderRequest, pointerWindowY: number) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onDraggingChange?.(true);
    setActiveDrag({
      ...request,
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
    onDraggingChange?.(false);
    if (!didComplete || finishedDrag === null) {
      return;
    }
    const { drag, viewportTop: finishedViewportTop } = finishedDrag;
    const { pointerY, scrollOffset } = dragViewportPosition(drag, finishedViewportTop, rowHeight);
    const targetIndex = targetSlotIndex(scrollOffset, pointerY, { rowHeight, rowCount: drag.rows.length });
    commitMove(drag, targetIndex - drag.fromIndex);
  };

  const renderDragHandle: RenderDragHandle = (accessibilityLabel, request) => (
    <DragHandle
      accessibilityLabel={accessibilityLabel}
      onDragStart={(pointerWindowY) => startDrag(request, pointerWindowY)}
      onDragMove={movePointer}
      onDragEnd={endDrag}
      onMove={(slotOffset) => commitMove(request, slotOffset)}
    />
  );

  const dragPosition = activeDrag === null ? null : dragViewportPosition(activeDrag, viewportTop, rowHeight);
  const previewRows =
    activeDrag === null || dragPosition === null
      ? []
      : moveBlockKey(
          activeDrag.rows.map((row) => row.key),
          activeDrag.fromIndex,
          targetSlotIndex(dragPosition.scrollOffset, dragPosition.pointerY, { rowHeight, rowCount }) -
            activeDrag.fromIndex,
        ).flatMap((rowKey) => activeDrag.rows.filter((row) => row.key === rowKey));
  const draggedRowKey = activeDrag?.rows[activeDrag.fromIndex]?.key;

  return (
    <Box flex={1}>
      <ScrollBox gap={gap} automaticallyAdjustKeyboardInsets scrollEnabled={!isDragging}>
        {children(renderDragHandle)}
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
            {previewRows.map((row) => {
              const isDragged = row.key === draggedRowKey;
              return (
                <AnimatedBox key={row.key} motion="reorder" style={{ height: rowHeight }}>
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
                        {row.label}
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
