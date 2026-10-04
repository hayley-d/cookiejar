import { useColorScheme } from 'react-native';

import type { ColorSchemeName } from '@/theme/tokens';

export function useColorSchemeName(): ColorSchemeName {
  return useColorScheme() === 'dark' ? 'dark' : 'light';
}
