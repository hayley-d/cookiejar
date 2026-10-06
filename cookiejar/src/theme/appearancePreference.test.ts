import { describe, expect, test } from 'bun:test';

import { parseAppearancePreference } from '@/theme/appearancePreference';

describe('parseAppearancePreference', () => {
  test('keeps an explicit light or dark choice', () => {
    expect(parseAppearancePreference('light')).toBe('light');
    expect(parseAppearancePreference('dark')).toBe('dark');
  });

  test('falls back to following the system', () => {
    expect(parseAppearancePreference('system')).toBe('system');
    expect(parseAppearancePreference(null)).toBe('system');
    expect(parseAppearancePreference('sepia')).toBe('system');
  });
});
