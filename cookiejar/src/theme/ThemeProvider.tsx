import { useMemo, type ReactNode } from 'react';

import { ThemeContext } from '@/theme/ThemeContext';
import { createTheme } from '@/theme/tokens';
import { useColorSchemeName } from '@/theme/useColorSchemeName';

type ThemeProviderProperties = {
  children: ReactNode;
};

export function ThemeProvider({ children }: ThemeProviderProperties) {
  const colorSchemeName = useColorSchemeName();
  const theme = useMemo(() => createTheme(colorSchemeName), [colorSchemeName]);

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}
