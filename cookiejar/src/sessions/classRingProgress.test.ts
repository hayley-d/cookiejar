import { describe, expect, test } from 'bun:test';

import { classRingProgress, plannedDurationLabel } from '@/sessions/classRingProgress';

describe('classRingProgress', () => {
  test('is the fraction of the planned duration elapsed', () => {
    expect(classRingProgress(900, 60)).toBe(0.25);
  });

  test('starts empty', () => {
    expect(classRingProgress(0, 45)).toBe(0);
  });

  test('is full at exactly the planned duration', () => {
    expect(classRingProgress(2700, 45)).toBe(1);
  });

  test('stays full past the planned duration', () => {
    expect(classRingProgress(9000, 45)).toBe(1);
  });

  test('stays empty with no planned duration', () => {
    expect(classRingProgress(900, null)).toBe(0);
  });

  test('stays empty with a zero planned duration', () => {
    expect(classRingProgress(900, 0)).toBe(0);
  });

  test('never goes negative', () => {
    expect(classRingProgress(-5, 30)).toBe(0);
  });
});

describe('plannedDurationLabel', () => {
  test('names the planned minutes', () => {
    expect(plannedDurationLabel(45)).toBe('of 45 min');
  });

  test('is absent with no planned duration', () => {
    expect(plannedDurationLabel(null)).toBeNull();
    expect(plannedDurationLabel(0)).toBeNull();
  });
});
