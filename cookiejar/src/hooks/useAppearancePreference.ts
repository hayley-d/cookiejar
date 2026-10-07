import { useContext } from 'react';

import { AppearancePreferenceContext } from '@/theme/AppearancePreferenceContext';

export function useAppearancePreference() {
  return useContext(AppearancePreferenceContext);
}
