import type { TextStyle } from 'react-native';

export type ColorSchemeName = 'light' | 'dark';

export type Palette = {
  background: string;
  surface: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  accentSoft: string;
  onAccent: string;
  success: string;
  danger: string;
  cardShadow: string;
  tabBar: string;
};

export const palettes: Record<ColorSchemeName, Palette> = {
  light: {
    background: '#CFE8FA',
    surface: '#FFFFFF',
    border: '#B5D6EE',
    textPrimary: '#1B2A40',
    textSecondary: '#5B7088',
    accent: '#F28DB2',
    accentSoft: '#FCE3EE',
    onAccent: '#1B2A40',
    success: '#5BBF8A',
    danger: '#D9534F',
    cardShadow: '#7FA9CC',
    tabBar: '#FFFFFF',
  },
  dark: {
    background: '#0F1B2D',
    surface: '#1B2A40',
    border: '#2A3D57',
    textPrimary: '#F2F6FB',
    textSecondary: '#A9B8CA',
    accent: '#F7A8C6',
    accentSoft: '#4A2A3A',
    onAccent: '#1B2A40',
    success: '#6FD39E',
    danger: '#E5675A',
    cardShadow: '#000000',
    tabBar: '#16233A',
  },
};

export const spacing = {
  none: 0,
  extraSmall: 4,
  small: 8,
  medium: 16,
  large: 24,
  extraLarge: 32,
};

export const radii = {
  none: 0,
  small: 6,
  medium: 12,
  large: 20,
  extraLarge: 28,
  round: 999,
};

export const sizes = {
  dragHandleIcon: 20,
  reorderRow: 56,
};

export const durations = {
  dragLongPress: 300,
};

export const typography = {
  display: { fontSize: 32, lineHeight: 38, fontWeight: '800' },
  title: { fontSize: 22, lineHeight: 28, fontWeight: '700' },
  heading: { fontSize: 18, lineHeight: 24, fontWeight: '700' },
  body: { fontSize: 16, lineHeight: 22, fontWeight: '400' },
  label: { fontSize: 15, lineHeight: 20, fontWeight: '600' },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '400' },
} satisfies Record<string, TextStyle>;

export type Shadow = {
  shadowColor: string;
  shadowOffset: { width: number; height: number };
  shadowOpacity: number;
  shadowRadius: number;
  elevation: number;
};

export function createShadows(colors: Palette) {
  return {
    card: {
      shadowColor: colors.cardShadow,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 4,
    } satisfies Shadow,
  };
}

export type ColorName = keyof Palette;
export type SpacingName = keyof typeof spacing;
export type RadiusName = keyof typeof radii;
export type TypographyVariant = keyof typeof typography;

export type Theme = {
  colorScheme: ColorSchemeName;
  colors: Palette;
  spacing: typeof spacing;
  radii: typeof radii;
  sizes: typeof sizes;
  durations: typeof durations;
  typography: typeof typography;
  shadows: ReturnType<typeof createShadows>;
};

export function createTheme(colorScheme: ColorSchemeName): Theme {
  return {
    colorScheme,
    colors: palettes[colorScheme],
    spacing,
    radii,
    sizes,
    durations,
    typography,
    shadows: createShadows(palettes[colorScheme]),
  };
}
