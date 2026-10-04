import { createContext } from 'react';

import { createTheme, type Theme } from '@/theme/tokens';

export const ThemeContext = createContext<Theme>(createTheme('light'));
