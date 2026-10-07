import type { AppearancePreference } from '@/theme/appearancePreference';
import type { ColorSchemeName } from '@/theme/tokens';

export function resolveColorSchemeName(
  preference: AppearancePreference,
  systemColorScheme: string | null | undefined,
): ColorSchemeName {
  if (preference !== 'system') {
    return preference;
  }
  return systemColorScheme === 'dark' ? 'dark' : 'light';
}
