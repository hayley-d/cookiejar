import { Fragment, type ReactNode } from 'react';

import { ReorderableScroll } from '@/components/organisms/ReorderableScroll';
import type { ItemBlock } from '@/workouts/groupIntoBlocks';
import type { EditorItem } from '@/workouts/workoutEditorReducer';

type ReorderableExerciseListProperties = {
  blocks: ItemBlock<EditorItem>[];
  onReorder: (blockKeys: string[]) => void;
  onDraggingChange: (isDragging: boolean) => void;
  renderItem: (item: EditorItem, itemIndex: number, dragHandle: ReactNode) => ReactNode;
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
  const rows = blocks.map((block) => ({ key: block.key, label: describeBlock(block) }));
  const blockEntries = blocks.flatMap((block, blockIndex) => block.items.map((item) => ({ item, blockIndex })));

  return (
    <ReorderableScroll onDraggingChange={onDraggingChange}>
      {(renderDragHandle) =>
        blockEntries.map(({ item, blockIndex }, itemIndex) => (
          <Fragment key={item.key}>
            {renderItem(
              item,
              itemIndex,
              renderDragHandle(`Reorder ${item.exercise.name}`, { rows, fromIndex: blockIndex, onCommit: onReorder }),
            )}
          </Fragment>
        ))
      }
    </ReorderableScroll>
  );
}
