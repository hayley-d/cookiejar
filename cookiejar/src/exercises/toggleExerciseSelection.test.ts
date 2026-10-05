import { describe, expect, test } from 'bun:test';

import { toggleExerciseSelection } from '@/exercises/toggleExerciseSelection';

describe('toggleExerciseSelection', () => {
  test('ticking an exercise adds it to the end', () => {
    expect(toggleExerciseSelection([4, 2], 7)).toEqual([4, 2, 7]);
  });

  test('keeps the order exercises were ticked in, not their id order', () => {
    const selection = [9, 3, 5].reduce(toggleExerciseSelection, [] as number[]);
    expect(selection).toEqual([9, 3, 5]);
  });

  test('unticking an exercise removes it and keeps the rest in order', () => {
    expect(toggleExerciseSelection([9, 3, 5], 3)).toEqual([9, 5]);
  });

  test('ticking an exercise again after unticking moves it to the end', () => {
    const selection = [9, 3, 5, 3, 3].reduce(toggleExerciseSelection, [] as number[]);
    expect(selection).toEqual([9, 5, 3]);
  });

  test('does not change the selection it was given', () => {
    const selection = [1, 2];
    toggleExerciseSelection(selection, 3);
    toggleExerciseSelection(selection, 1);
    expect(selection).toEqual([1, 2]);
  });
});
