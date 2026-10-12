import { describe, expect, test } from 'bun:test';

import { sortSwimStrokes, swimStrokeDisplayOrder } from '@/swimming/sortSwimStrokes';

describe('sortSwimStrokes', () => {
  test('orders the built-in strokes in spec order regardless of input order', () => {
    const shuffledStrokes = [...swimStrokeDisplayOrder].reverse().map((name) => ({ name }));
    expect(sortSwimStrokes(shuffledStrokes).map((stroke) => stroke.name)).toEqual(swimStrokeDisplayOrder);
  });

  test('puts other swimming exercises after the built-ins, alphabetically', () => {
    const sortedNames = sortSwimStrokes([{ name: 'Zig Zag' }, { name: 'Drill' }, { name: 'Ankle Weights' }, { name: 'Freestyle' }]).map(
      (stroke) => stroke.name,
    );
    expect(sortedNames).toEqual(['Freestyle', 'Drill', 'Ankle Weights', 'Zig Zag']);
  });
});
