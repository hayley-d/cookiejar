import { describe, expect, test } from 'bun:test';

import { resolveColorSchemeName } from '@/theme/resolveColorSchemeName';

describe('resolveColorSchemeName', () => {
  test('follows the system when the preference is system', () => {
    expect(resolveColorSchemeName('system', 'light')).toBe('light');
    expect(resolveColorSchemeName('system', 'dark')).toBe('dark');
    expect(resolveColorSchemeName('system', null)).toBe('light');
    expect(resolveColorSchemeName('system', 'unspecified')).toBe('light');
  });

  test('keeps an explicit choice regardless of the system', () => {
    expect(resolveColorSchemeName('light', 'dark')).toBe('light');
    expect(resolveColorSchemeName('dark', 'light')).toBe('dark');
    expect(resolveColorSchemeName('light', null)).toBe('light');
    expect(resolveColorSchemeName('dark', null)).toBe('dark');
  });
});
