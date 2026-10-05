import { describe, expect, test } from 'bun:test';

import { autoScrolledOffset, dragViewportPosition, initialScrollOffset, targetSlotIndex } from '@/workouts/reorderDrag';

const geometry = { rowHeight: 50, rowCount: 20, viewportHeight: 400 };
const autoScroll = { edgeSize: 60, step: 10 };

describe('initialScrollOffset', () => {
  test('puts the middle of the dragged row under the pointer', () => {
    const scrollOffset = initialScrollOffset(12, 300, 50);
    expect(scrollOffset).toBe(325);
    expect(targetSlotIndex(scrollOffset, 300, geometry)).toBe(12);
  });

  test('can start above the first row so an early row stays under the pointer', () => {
    const scrollOffset = initialScrollOffset(0, 300, 50);
    expect(scrollOffset).toBe(-275);
    expect(targetSlotIndex(scrollOffset, 300, geometry)).toBe(0);
  });
});

describe('targetSlotIndex', () => {
  test('is the row under the pointer after scrolling', () => {
    expect(targetSlotIndex(500, 120, geometry)).toBe(12);
  });

  test('clamps to the first and last rows', () => {
    expect(targetSlotIndex(-275, 10, geometry)).toBe(0);
    expect(targetSlotIndex(800, 390, geometry)).toBe(19);
  });

  test('is zero for an empty list', () => {
    expect(targetSlotIndex(0, 100, { ...geometry, rowCount: 0 })).toBe(0);
  });
});

describe('autoScrolledOffset', () => {
  test('scrolls up while the pointer is near the top edge', () => {
    expect(autoScrolledOffset(100, 20, geometry, autoScroll)).toBe(90);
    expect(autoScrolledOffset(4, 20, geometry, autoScroll)).toBe(0);
  });

  test('scrolls down while the pointer is near the bottom edge, stopping at the last row', () => {
    expect(autoScrolledOffset(100, 380, geometry, autoScroll)).toBe(110);
    expect(autoScrolledOffset(595, 380, geometry, autoScroll)).toBe(600);
    expect(autoScrolledOffset(600, 380, geometry, autoScroll)).toBe(600);
  });

  test('stays put away from the edges', () => {
    expect(autoScrolledOffset(100, 200, geometry, autoScroll)).toBe(100);
  });

  test('leaves a starting offset outside the scroll range alone until it is needed', () => {
    expect(autoScrolledOffset(-275, 20, geometry, autoScroll)).toBe(-275);
    expect(autoScrolledOffset(-275, 380, geometry, autoScroll)).toBe(-265);
  });

  test('does not scroll a list that fits in the viewport', () => {
    expect(autoScrolledOffset(0, 380, { ...geometry, rowCount: 4 }, autoScroll)).toBe(0);
  });
});

describe('dragViewportPosition', () => {
  const dragPointer = { fromIndex: 3, startPointerWindowY: 400, pointerWindowY: 460, autoScrollDistance: 20 };

  test('measures the pointer and scroll offset from the viewport top', () => {
    expect(dragViewportPosition(dragPointer, 100, 50)).toEqual({ pointerY: 360, scrollOffset: -105 });
  });

  test('the slot under the pointer does not depend on where the viewport is measured', () => {
    const positionFromFirstMeasure = dragViewportPosition(dragPointer, 100, 50);
    const positionFromLaterMeasure = dragViewportPosition(dragPointer, 140, 50);
    expect(targetSlotIndex(positionFromFirstMeasure.scrollOffset, positionFromFirstMeasure.pointerY, geometry)).toBe(
      targetSlotIndex(positionFromLaterMeasure.scrollOffset, positionFromLaterMeasure.pointerY, geometry),
    );
  });

  test('with no movement the dragged row stays under the pointer', () => {
    const position = dragViewportPosition({ ...dragPointer, pointerWindowY: 400, autoScrollDistance: 0 }, 100, 50);
    expect(targetSlotIndex(position.scrollOffset, position.pointerY, geometry)).toBe(3);
  });
});
