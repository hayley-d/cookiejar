import { describe, expect, test } from 'bun:test';

import { formatNumberText, parseNumberText } from '@/numbers/numberText';

describe('parseNumberText', () => {
  test('whole numbers', () => {
    expect(parseNumberText('12', 0)).toEqual({ isAccepted: true, value: 12 });
  });

  test('empty text is accepted as no value', () => {
    expect(parseNumberText('', 0)).toEqual({ isAccepted: true, value: null });
    expect(parseNumberText('  ', 1)).toEqual({ isAccepted: true, value: null });
    expect(parseNumberText('.', 1)).toEqual({ isAccepted: true, value: null });
  });

  test('a decimal point is refused when no decimal places are allowed', () => {
    expect(parseNumberText('12.5', 0)).toEqual({ isAccepted: false });
  });

  test('decimals up to the allowed places', () => {
    expect(parseNumberText('62.5', 1)).toEqual({ isAccepted: true, value: 62.5 });
    expect(parseNumberText('62.', 1)).toEqual({ isAccepted: true, value: 62 });
    expect(parseNumberText('62.55', 1)).toEqual({ isAccepted: false });
    expect(parseNumberText('1.234', 3)).toEqual({ isAccepted: true, value: 1.234 });
  });

  test('a comma works as the decimal separator', () => {
    expect(parseNumberText('2,5', 1)).toEqual({ isAccepted: true, value: 2.5 });
  });

  test('letters and signs are refused', () => {
    expect(parseNumberText('1a', 0)).toEqual({ isAccepted: false });
    expect(parseNumberText('-3', 1)).toEqual({ isAccepted: false });
  });
});

describe('formatNumberText', () => {
  test('shows the number, or nothing for no value', () => {
    expect(formatNumberText(62.5)).toBe('62.5');
    expect(formatNumberText(null)).toBe('');
  });
});
