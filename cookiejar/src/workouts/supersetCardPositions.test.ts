import { describe, expect, test } from 'bun:test';

import { toSupersetCardPositions } from '@/workouts/supersetCardPositions';

function positionsFor(supersetGroups: (string | null)[]) {
  return toSupersetCardPositions(supersetGroups.map((supersetGroup) => ({ supersetGroup })));
}

describe('toSupersetCardPositions', () => {
  test('an ungrouped card has no label or bracket', () => {
    expect(positionsFor([null])[0]).toEqual({ label: null, bracket: null, isLinkedToNext: false, isLastItem: true });
  });

  test('a two-card superset is labelled A1 and A2 with a start and end bracket', () => {
    const positions = positionsFor(['A', 'A']);
    expect(positions.map((position) => position.label)).toEqual(['A1', 'A2']);
    expect(positions.map((position) => position.bracket)).toEqual(['start', 'end']);
    expect(positions.map((position) => position.isLinkedToNext)).toEqual([true, false]);
  });

  test('a tri-set has a middle bracket', () => {
    const positions = positionsFor(['A', 'A', 'A']);
    expect(positions.map((position) => position.label)).toEqual(['A1', 'A2', 'A3']);
    expect(positions.map((position) => position.bracket)).toEqual(['start', 'middle', 'end']);
  });

  test('numbers restart in each group', () => {
    const positions = positionsFor(['A', 'A', null, 'B', 'B']);
    expect(positions.map((position) => position.label)).toEqual(['A1', 'A2', null, 'B1', 'B2']);
  });

  test('only the last card is the last item', () => {
    expect(positionsFor([null, 'A', 'A']).map((position) => position.isLastItem)).toEqual([false, false, true]);
  });
});
