import { describe, expect, test } from 'bun:test';

import { formatDuration } from '@/dates/formatDuration';
import { parseDuration } from '@/dates/parseDuration';

describe('formatDuration', () => {
  test('minutes and seconds', () => {
    expect(formatDuration(90)).toBe('1m 30s');
  });

  test('seconds only', () => {
    expect(formatDuration(45)).toBe('45s');
  });

  test('whole minutes drop the seconds', () => {
    expect(formatDuration(120)).toBe('2m');
  });

  test('hours', () => {
    expect(formatDuration(3725)).toBe('1h 2m 5s');
  });

  test('zero', () => {
    expect(formatDuration(0)).toBe('0s');
  });
});

describe('parseDuration', () => {
  test('plain seconds', () => {
    expect(parseDuration('90')).toBe(90);
  });

  test('clock format', () => {
    expect(parseDuration('1:30')).toBe(90);
  });

  test('minutes and seconds with units', () => {
    expect(parseDuration('1m 30s')).toBe(90);
  });

  test('minutes only', () => {
    expect(parseDuration('1m')).toBe(60);
  });

  test('seconds with a unit', () => {
    expect(parseDuration('45s')).toBe(45);
  });

  test('units without spaces', () => {
    expect(parseDuration('1m30s')).toBe(90);
  });

  test('ignores surrounding whitespace and case', () => {
    expect(parseDuration('  2M  ')).toBe(120);
  });

  test('round-trips with formatDuration', () => {
    expect(parseDuration(formatDuration(3725))).toBe(3725);
  });

  test('rejects empty text', () => {
    expect(parseDuration('')).toBeNull();
    expect(parseDuration('   ')).toBeNull();
  });

  test('rejects clock seconds of 60 or more', () => {
    expect(parseDuration('1:75')).toBeNull();
  });

  test('rejects nonsense', () => {
    expect(parseDuration('abc')).toBeNull();
    expect(parseDuration('1.5m')).toBeNull();
  });
});
