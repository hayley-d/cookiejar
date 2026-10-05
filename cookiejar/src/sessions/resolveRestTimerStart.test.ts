import { describe, expect, test } from 'bun:test';

import { resolveRestTimerStart } from '@/sessions/resolveRestTimerStart';

const completedAt = '2026-10-05T10:00:00Z';

function makeExercise(
  supersetGroup: string | null,
  restSeconds: number | null,
  sets: { id: number; isDone: boolean }[],
) {
  return {
    supersetGroup,
    restSeconds,
    sets: sets.map((set) => ({ id: set.id, completedAt: set.isDone ? completedAt : null })),
  };
}

describe('resolveRestTimerStart', () => {
  test('a set outside a superset starts rest with its own rest time', () => {
    const exercises = [makeExercise(null, 120, [{ id: 1, isDone: true }])];
    expect(resolveRestTimerStart(exercises, 1)).toEqual({ shouldStart: true, restSeconds: 120 });
  });

  test('a null rest time falls back to 90 seconds', () => {
    const exercises = [makeExercise(null, null, [{ id: 1, isDone: true }])];
    expect(resolveRestTimerStart(exercises, 1)).toEqual({ shouldStart: true, restSeconds: 90 });
  });

  test('an unknown set or a set that is not ticked does not start rest', () => {
    const exercises = [makeExercise(null, 60, [{ id: 1, isDone: false }])];
    expect(resolveRestTimerStart(exercises, 1)).toEqual({ shouldStart: false });
    expect(resolveRestTimerStart(exercises, 99)).toEqual({ shouldStart: false });
  });

  test('ticking the first member of a superset does not start rest', () => {
    const exercises = [
      makeExercise('A', 45, [{ id: 1, isDone: true }]),
      makeExercise('A', 75, [{ id: 2, isDone: false }]),
    ];
    expect(resolveRestTimerStart(exercises, 1)).toEqual({ shouldStart: false });
  });

  test('ticking the last member after the others starts rest with the last members rest time', () => {
    const exercises = [
      makeExercise('A', 45, [{ id: 1, isDone: true }]),
      makeExercise('A', 75, [{ id: 2, isDone: true }]),
    ];
    expect(resolveRestTimerStart(exercises, 2)).toEqual({ shouldStart: true, restSeconds: 75 });
  });

  test('ticking the last member before the earlier one for that round does not start rest', () => {
    const exercises = [
      makeExercise('A', 45, [
        { id: 1, isDone: false },
        { id: 3, isDone: false },
      ]),
      makeExercise('A', 75, [
        { id: 2, isDone: true },
        { id: 4, isDone: false },
      ]),
    ];
    expect(resolveRestTimerStart(exercises, 2)).toEqual({ shouldStart: false });
  });

  test('rounds are matched by set position', () => {
    const exercises = [
      makeExercise('A', 45, [
        { id: 1, isDone: true },
        { id: 3, isDone: false },
      ]),
      makeExercise('A', 75, [
        { id: 2, isDone: true },
        { id: 4, isDone: true },
      ]),
    ];
    expect(resolveRestTimerStart(exercises, 2)).toEqual({ shouldStart: true, restSeconds: 75 });
    expect(resolveRestTimerStart(exercises, 4)).toEqual({ shouldStart: false });
  });

  test('members lacking a set at that position count as done', () => {
    const exercises = [
      makeExercise('A', 45, [{ id: 1, isDone: true }]),
      makeExercise('A', null, [
        { id: 2, isDone: true },
        { id: 3, isDone: true },
      ]),
    ];
    expect(resolveRestTimerStart(exercises, 3)).toEqual({ shouldStart: true, restSeconds: 90 });
  });

  test('exercises of other groups and standalone exercises are ignored', () => {
    const exercises = [
      makeExercise('A', 45, [{ id: 1, isDone: true }]),
      makeExercise(null, 30, [{ id: 5, isDone: false }]),
      makeExercise('A', 75, [{ id: 2, isDone: true }]),
      makeExercise('B', 60, [{ id: 6, isDone: false }]),
    ];
    expect(resolveRestTimerStart(exercises, 2)).toEqual({ shouldStart: true, restSeconds: 75 });
  });
});
