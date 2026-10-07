import { useContext } from 'react';
import { useColorScheme } from 'react-native';

import { AppearancePreferenceContext } from '@/theme/AppearancePreferenceContext';
import { resolveColorSchemeName } from '@/theme/resolveColorSchemeName';
import type { ColorSchemeName } from '@/theme/tokens';

export function useColorSchemeName(): ColorSchemeName {
  const { appearancePreference } = useContext(AppearancePreferenceContext);
  return resolveColorSchemeName(appearancePreference, useColorScheme());
}
