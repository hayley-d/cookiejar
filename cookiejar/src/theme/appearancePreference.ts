export type AppearancePreference = 'system' | 'light' | 'dark';

export const appearancePreferenceSettingKey = 'appearance_preference';

export function parseAppearancePreference(value: string | null | undefined): AppearancePreference {
  return value === 'light' || value === 'dark' ? value : 'system';
}
