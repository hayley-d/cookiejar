export type ReorderDragGeometry = {
  rowHeight: number;
  rowCount: number;
  viewportHeight: number;
};

export type AutoScroll = {
  edgeSize: number;
  step: number;
};

export function initialScrollOffset(fromIndex: number, pointerY: number, rowHeight: number): number {
  return fromIndex * rowHeight + rowHeight / 2 - pointerY;
}

export function targetSlotIndex(
  scrollOffset: number,
  pointerY: number,
  geometry: Pick<ReorderDragGeometry, 'rowHeight' | 'rowCount'>,
): number {
  const slotIndex = Math.floor((scrollOffset + pointerY) / geometry.rowHeight);
  return Math.min(Math.max(slotIndex, 0), Math.max(geometry.rowCount - 1, 0));
}

export function autoScrolledOffset(
  scrollOffset: number,
  pointerY: number,
  geometry: ReorderDragGeometry,
  autoScroll: AutoScroll,
): number {
  const maximumScrollOffset = Math.max(geometry.rowCount * geometry.rowHeight - geometry.viewportHeight, 0);
  if (pointerY < autoScroll.edgeSize && scrollOffset > 0) {
    return Math.max(scrollOffset - autoScroll.step, 0);
  }
  if (pointerY > geometry.viewportHeight - autoScroll.edgeSize && scrollOffset < maximumScrollOffset) {
    return Math.min(scrollOffset + autoScroll.step, maximumScrollOffset);
  }
  return scrollOffset;
}

export type ReorderDragPointer = {
  fromIndex: number;
  startPointerWindowY: number;
  pointerWindowY: number;
  autoScrollDistance: number;
};

export function dragViewportPosition(dragPointer: ReorderDragPointer, viewportTop: number, rowHeight: number) {
  const startPointerY = dragPointer.startPointerWindowY - viewportTop;
  return {
    pointerY: dragPointer.pointerWindowY - viewportTop,
    scrollOffset: initialScrollOffset(dragPointer.fromIndex, startPointerY, rowHeight) + dragPointer.autoScrollDistance,
  };
}
