import { describe, expect, test } from 'bun:test';

import { normaliseSupersets } from '@/workouts/normaliseSupersets';

function itemsInGroups(supersetGroups: (string | null)[]) {
  return supersetGroups.map((supersetGroup, index) => ({ key: `item-${index}`, supersetGroup }));
}

function groupsOf(items: { supersetGroup: string | null }[]) {
  return items.map((item) => item.supersetGroup);
}

describe('normaliseSupersets', () => {
  test('reletters groups from top to bottom', () => {
    const items = itemsInGroups(['test-9', 'test-9', null, 'test-2', 'test-2', 'test-2']);
    expect(groupsOf(normaliseSupersets(items))).toEqual(['A', 'A', null, 'B', 'B', 'B']);
  });

  test('relettering follows the order of the items, not the order of the old letters', () => {
    const items = itemsInGroups(['B', 'B', 'A', 'A']);
    expect(groupsOf(normaliseSupersets(items))).toEqual(['A', 'A', 'B', 'B']);
  });

  test('closes the gap when an earlier group disappears', () => {
    const items = itemsInGroups(['A', null, 'B', 'B']);
    expect(groupsOf(normaliseSupersets(items))).toEqual([null, null, 'A', 'A']);
  });

  test('clears a group left with a single member', () => {
    const items = itemsInGroups(['A', null, 'B', 'B']);
    expect(normaliseSupersets(items)[0]?.supersetGroup).toBeNull();
  });

  test('leaves ungrouped items alone', () => {
    const items = itemsInGroups([null, null]);
    expect(groupsOf(normaliseSupersets(items))).toEqual([null, null]);
  });

  test('keeps the identity of items that do not change', () => {
    const items = itemsInGroups(['A', 'A', null]);
    const normalisedItems = normaliseSupersets(items);
    expect(normalisedItems[0]).toBe(items[0]);
    expect(normalisedItems[2]).toBe(items[2]);
  });

  test('keeps every other field when it changes a group', () => {
    const items = itemsInGroups(['x', 'x']);
    expect(normaliseSupersets(items)[1]).toEqual({ key: 'item-1', supersetGroup: 'A' });
  });

  test('handles an empty list', () => {
    expect(normaliseSupersets([])).toEqual([]);
  });
});
