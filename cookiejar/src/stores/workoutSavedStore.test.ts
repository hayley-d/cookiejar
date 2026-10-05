import { beforeEach, describe, expect, test } from 'bun:test';

import {
  announceWorkoutSaved,
  consumeWorkoutSavedNotice,
  peekWorkoutSavedNotice,
  resetWorkoutSavedNotices,
} from '@/stores/workoutSavedStore';

beforeEach(() => {
  resetWorkoutSavedNotices();
});

describe('workoutSavedStore', () => {
  test('there is no notice until a workout is saved', () => {
    expect(peekWorkoutSavedNotice()).toBeNull();
    expect(consumeWorkoutSavedNotice()).toBeNull();
  });

  test('a saved workout name waits until it is consumed', () => {
    announceWorkoutSaved('Morning Pilates');
    expect(peekWorkoutSavedNotice()).toEqual({ workoutName: 'Morning Pilates' });
    expect(peekWorkoutSavedNotice()).toEqual({ workoutName: 'Morning Pilates' });
  });

  test('a saved workout name is returned once, then nothing', () => {
    announceWorkoutSaved('Morning Pilates');
    expect(consumeWorkoutSavedNotice()).toEqual({ workoutName: 'Morning Pilates' });
    expect(consumeWorkoutSavedNotice()).toBeNull();
    expect(peekWorkoutSavedNotice()).toBeNull();
  });

  test('a later save replaces an unconsumed notice', () => {
    announceWorkoutSaved('Push Day');
    announceWorkoutSaved('Leg Day');
    expect(consumeWorkoutSavedNotice()).toEqual({ workoutName: 'Leg Day' });
  });

  test('saving the same name twice gives two distinct notices', () => {
    announceWorkoutSaved('Push Day');
    const firstNotice = consumeWorkoutSavedNotice();
    announceWorkoutSaved('Push Day');
    expect(consumeWorkoutSavedNotice()).not.toBe(firstNotice);
  });
});
