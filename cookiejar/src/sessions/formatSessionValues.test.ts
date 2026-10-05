import { describe, expect, test } from 'bun:test';

import {
  formatElapsedTime,
  formatSessionDuration,
  formatSetCount,
  formatVolume,
} from '@/sessions/formatSessionValues';

describe('formatElapsedTime', () => {
  test('shows hours, minutes and seconds with two digits each', () => {
    expect(formatElapsedTime(0)).toBe('00:00:00');
    expect(formatElapsedTime(23 * 60 + 41)).toBe('00:23:41');
    expect(formatElapsedTime(3600 + 5)).toBe('01:00:05');
  });
});

describe('formatSessionDuration', () => {
  test('shows minutes under an hour and hours with minutes after', () => {
    expect(formatSessionDuration(52 * 60)).toBe('52 min');
    expect(formatSessionDuration(20)).toBe('0 min');
    expect(formatSessionDuration(65 * 60)).toBe('1 h 5 min');
    expect(formatSessionDuration(120 * 60)).toBe('2 h');
  });
});

describe('formatVolume', () => {
  test('rounds to whole kilograms with thousands separators', () => {
    expect(formatVolume(4820)).toBe('4,820 kg');
    expect(formatVolume(7.5)).toBe('8 kg');
    expect(formatVolume(1234567)).toBe('1,234,567 kg');
    expect(formatVolume(0)).toBe('0 kg');
  });
});

describe('formatSetCount', () => {
  test('uses the singular for one set', () => {
    expect(formatSetCount(1)).toBe('1 set');
    expect(formatSetCount(18)).toBe('18 sets');
  });
});
