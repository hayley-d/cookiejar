import { describe, expect, test } from 'bun:test';

import { topRepetitionsFor } from '@/progress/topRepetitionsFor';

describe('topRepetitionsFor', () => {
  test('the highest target repetitions wins', () => {
    expect(topRepetitionsFor([8, 12, 10], 'strength')).toBe(12);
  });

  test('empty target repetitions are ignored', () => {
    expect(topRepetitionsFor([null, 8, null], 'endurance')).toBe(8);
  });

  test('strength without targets is 6', () => {
    expect(topRepetitionsFor([], 'strength')).toBe(6);
  });

  test('hypertrophy without targets is 12', () => {
    expect(topRepetitionsFor([null], 'hypertrophy')).toBe(12);
  });

  test('general fitness without targets is 12', () => {
    expect(topRepetitionsFor([], 'general_fitness')).toBe(12);
  });

  test('endurance without targets is 20', () => {
    expect(topRepetitionsFor([], 'endurance')).toBe(20);
  });

  test('weight loss without targets is 12', () => {
    expect(topRepetitionsFor([], 'weight_loss')).toBe(12);
  });

  test('no goal without targets is 12', () => {
    expect(topRepetitionsFor([], null)).toBe(12);
  });
});
