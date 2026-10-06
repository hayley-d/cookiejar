import { Appearance } from 'react-native';

import type { AppearancePreference } from '@/theme/appearancePreference';

export function applyAppearancePreference(preference: AppearancePreference) {
  Appearance.setColorScheme(preference === 'system' ? 'unspecified' : preference);
}
