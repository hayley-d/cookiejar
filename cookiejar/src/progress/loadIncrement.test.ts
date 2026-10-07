import { describe, expect, test } from 'bun:test';

import { incrementForLoad, roundDownToIncrement } from '@/progress/loadIncrement';

describe('incrementForLoad', () => {
  test('is 1 kg below 20 kg', () => {
    expect(incrementForLoad(19.5)).toBe(1);
  });

  test('is 2.5 kg from 20 kg', () => {
    expect(incrementForLoad(20)).toBe(2.5);
  });
});

describe('roundDownToIncrement', () => {
  test('rounds down to a whole kilogram below 20 kg', () => {
    expect(roundDownToIncrement(14.9)).toBe(14);
  });

  test('rounds down to a 2.5 kg step from 20 kg', () => {
    expect(roundDownToIncrement(47.4)).toBe(45);
  });

  test('keeps exactly 20 kg', () => {
    expect(roundDownToIncrement(20)).toBe(20);
  });
});
