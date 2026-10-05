import { beforeEach, describe, expect, test } from 'bun:test';

import {
  beginExercisePick,
  completeExercisePick,
  consumeExercisePickResult,
  createExercisePickRequestIdentifier,
  peekExercisePickResult,
  resetExercisePicks,
  subscribeToExercisePicks,
} from '@/stores/exercisePickerStore';

const pickResult = { exerciseIds: [3, 1, 2], asSuperset: false };

beforeEach(() => {
  resetExercisePicks();
});

describe('exercisePickerStore', () => {
  test('a begun pick has no result until it is completed', () => {
    beginExercisePick('first');
    expect(peekExercisePickResult('first')).toBeNull();
  });

  test('a completed pick returns its result once, then nothing', () => {
    beginExercisePick('first');
    completeExercisePick('first', pickResult);
    expect(consumeExercisePickResult('first')).toEqual(pickResult);
    expect(consumeExercisePickResult('first')).toBeNull();
    expect(peekExercisePickResult('first')).toBeNull();
  });

  test('peeking does not consume the result', () => {
    beginExercisePick('first');
    completeExercisePick('first', pickResult);
    expect(peekExercisePickResult('first')).toEqual(pickResult);
    expect(peekExercisePickResult('first')).toEqual(pickResult);
  });

  test('completing a pick that was never begun is ignored', () => {
    completeExercisePick('unknown', pickResult);
    expect(consumeExercisePickResult('unknown')).toBeNull();
  });

  test('a consumed pick cannot be completed again', () => {
    beginExercisePick('first');
    completeExercisePick('first', pickResult);
    consumeExercisePickResult('first');
    completeExercisePick('first', { exerciseIds: [9], asSuperset: true });
    expect(consumeExercisePickResult('first')).toBeNull();
  });

  test('picks are kept apart by request identifier', () => {
    beginExercisePick('first');
    beginExercisePick('second');
    completeExercisePick('second', pickResult);
    expect(consumeExercisePickResult('first')).toBeNull();
    expect(consumeExercisePickResult('second')).toEqual(pickResult);
  });

  test('beginning a pick again clears an unconsumed result', () => {
    beginExercisePick('first');
    completeExercisePick('first', pickResult);
    beginExercisePick('first');
    expect(peekExercisePickResult('first')).toBeNull();
  });

  test('listeners hear about completions and consumptions until they unsubscribe', () => {
    let notificationCount = 0;
    const unsubscribe = subscribeToExercisePicks(() => {
      notificationCount += 1;
    });
    beginExercisePick('first');
    completeExercisePick('first', pickResult);
    consumeExercisePickResult('first');
    expect(notificationCount).toBe(2);
    unsubscribe();
    beginExercisePick('first');
    completeExercisePick('first', pickResult);
    expect(notificationCount).toBe(2);
  });

  test('request identifiers are unique', () => {
    expect(createExercisePickRequestIdentifier()).not.toBe(createExercisePickRequestIdentifier());
  });
});
