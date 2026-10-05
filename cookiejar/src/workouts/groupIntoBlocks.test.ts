import { describe, expect, test } from 'bun:test';

import { applyBlockOrder, groupIntoBlocks, moveBlockKey } from '@/workouts/groupIntoBlocks';

type TestItem = { key: string; supersetGroup: string | null };

const items: TestItem[] = [
  { key: 'squat', supersetGroup: null },
  { key: 'curl', supersetGroup: 'A' },
  { key: 'dip', supersetGroup: 'A' },
  { key: 'plank', supersetGroup: null },
  { key: 'row', supersetGroup: 'B' },
  { key: 'press', supersetGroup: 'B' },
];

function keysOf(orderedItems: TestItem[]) {
  return orderedItems.map((item) => item.key);
}

describe('groupIntoBlocks', () => {
  test('every ungrouped item is its own block', () => {
    const singleItems = [
      { key: 'squat', supersetGroup: null },
      { key: 'plank', supersetGroup: null },
    ];
    expect(groupIntoBlocks(singleItems)).toEqual([
      { key: 'squat', supersetGroup: null, items: [singleItems[0]] },
      { key: 'plank', supersetGroup: null, items: [singleItems[1]] },
    ]);
  });

  test('a superset is one block keyed by its first member', () => {
    const blocks = groupIntoBlocks(items);
    expect(blocks.map((block) => block.key)).toEqual(['squat', 'curl', 'plank', 'row']);
    expect(keysOf(blocks[1].items)).toEqual(['curl', 'dip']);
    expect(blocks[1].supersetGroup).toBe('A');
  });

  test('an empty list has no blocks', () => {
    expect(groupIntoBlocks([])).toEqual([]);
  });
});

describe('applyBlockOrder', () => {
  test('moves a single item to its new block position', () => {
    expect(keysOf(applyBlockOrder(items, ['curl', 'plank', 'squat', 'row']))).toEqual([
      'curl',
      'dip',
      'plank',
      'squat',
      'row',
      'press',
    ]);
  });

  test('moves a superset as one block', () => {
    expect(keysOf(applyBlockOrder(items, ['squat', 'plank', 'row', 'curl']))).toEqual([
      'squat',
      'plank',
      'row',
      'press',
      'curl',
      'dip',
    ]);
  });

  test('a member key that is not a block key cannot split a superset', () => {
    expect(keysOf(applyBlockOrder(items, ['dip', 'squat', 'curl', 'plank', 'row']))).toEqual([
      'squat',
      'curl',
      'dip',
      'plank',
      'row',
      'press',
    ]);
  });

  test('unknown and repeated keys are ignored, and missing blocks keep their order at the end', () => {
    expect(keysOf(applyBlockOrder(items, ['row', 'missing', 'row', 'plank']))).toEqual([
      'row',
      'press',
      'plank',
      'squat',
      'curl',
      'dip',
    ]);
  });

  test('returns the same list when the order does not change', () => {
    expect(applyBlockOrder(items, ['squat', 'curl', 'plank', 'row'])).toBe(items);
    expect(applyBlockOrder(items, [])).toBe(items);
  });
});

describe('moveBlockKey', () => {
  const blockKeys = ['squat', 'curl', 'plank', 'row'];

  test('moves a key down by its slot offset', () => {
    expect(moveBlockKey(blockKeys, 0, 2)).toEqual(['curl', 'plank', 'squat', 'row']);
  });

  test('moves a key up by its slot offset', () => {
    expect(moveBlockKey(blockKeys, 3, -2)).toEqual(['squat', 'row', 'curl', 'plank']);
  });

  test('clamps the offset to the ends of the list', () => {
    expect(moveBlockKey(blockKeys, 1, 10)).toEqual(['squat', 'plank', 'row', 'curl']);
    expect(moveBlockKey(blockKeys, 2, -10)).toEqual(['plank', 'squat', 'curl', 'row']);
  });

  test('returns the same keys for no offset or an unknown index', () => {
    expect(moveBlockKey(blockKeys, 1, 0)).toBe(blockKeys);
    expect(moveBlockKey(blockKeys, 7, 1)).toBe(blockKeys);
  });
});
