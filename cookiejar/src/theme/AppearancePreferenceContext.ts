import { createContext } from 'react';

import type { AppearancePreference } from '@/theme/appearancePreference';

export type AppearancePreferenceContextValue = {
  appearancePreference: AppearancePreference;
  changeAppearancePreference: (preference: AppearancePreference) => void;
};

export const AppearancePreferenceContext = createContext<AppearancePreferenceContextValue>({
  appearancePreference: 'system',
  changeAppearancePreference: () => {},
});
