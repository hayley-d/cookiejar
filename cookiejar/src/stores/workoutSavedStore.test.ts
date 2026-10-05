import { beforeEach, describe, expect, test } from 'bun:test';

import {
  announceWorkoutSaved,
  consumeWorkoutSavedNotice,
  peekWorkoutSavedNotice,
  resetWorkoutSavedNotices,
  subscribeToWorkoutSavedNotices,
} from '@/stores/workoutSavedStore';

beforeEach(() => {
  resetWorkoutSavedNotices();
});

describe('workoutSavedStore', () => {
  test('there is no notice until a workout is saved', () => {
    expect(peekWorkoutSavedNotice()).toBeNull();
  });

  test('a saved workout name is returned once, then nothing', () => {
    announceWorkoutSaved('Morning Pilates');
    expect(consumeWorkoutSavedNotice()).toEqual({ workoutName: 'Morning Pilates' });
    expect(consumeWorkoutSavedNotice()).toBeNull();
    expect(peekWorkoutSavedNotice()).toBeNull();
  });

  test('peeking does not consume the notice', () => {
    announceWorkoutSaved('Push Day');
    expect(peekWorkoutSavedNotice()).toEqual({ workoutName: 'Push Day' });
    expect(peekWorkoutSavedNotice()).toEqual({ workoutName: 'Push Day' });
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

  test('listeners hear about saves and consumptions until they unsubscribe', () => {
    let notificationCount = 0;
    const unsubscribe = subscribeToWorkoutSavedNotices(() => {
      notificationCount += 1;
    });
    announceWorkoutSaved('Push Day');
    consumeWorkoutSavedNotice();
    consumeWorkoutSavedNotice();
    expect(notificationCount).toBe(2);
    unsubscribe();
    announceWorkoutSaved('Push Day');
    expect(notificationCount).toBe(2);
  });
});
