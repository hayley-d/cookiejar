import type { TextStyle } from 'react-native';

export type ColorSchemeName = 'light' | 'dark';

export type Palette = {
  background: string;
  surface: string;
  border: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  onAccent: string;
  danger: string;
};

export const palettes: Record<ColorSchemeName, Palette> = {
  light: {
    background: '#FBF7F2',
    surface: '#FFFFFF',
    border: '#E8DFD3',
    textPrimary: '#2A1E14',
    textSecondary: '#7A6A5B',
    accent: '#D9822B',
    onAccent: '#1F1300',
    danger: '#C0392B',
  },
  dark: {
    background: '#14100C',
    surface: '#211A14',
    border: '#3A2F25',
    textPrimary: '#F5EDE3',
    textSecondary: '#B3A391',
    accent: '#F0A04B',
    onAccent: '#1F1300',
    danger: '#E5675A',
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
  round: 999,
};

export const typography = {
  display: { fontSize: 32, lineHeight: 38, fontWeight: '800' },
  title: { fontSize: 22, lineHeight: 28, fontWeight: '700' },
  body: { fontSize: 16, lineHeight: 22, fontWeight: '400' },
  label: { fontSize: 15, lineHeight: 20, fontWeight: '600' },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '400' },
} satisfies Record<string, TextStyle>;

export type ColorName = keyof Palette;
export type SpacingName = keyof typeof spacing;
export type RadiusName = keyof typeof radii;
export type TypographyVariant = keyof typeof typography;

export type Theme = {
  colorScheme: ColorSchemeName;
  colors: Palette;
  spacing: typeof spacing;
  radii: typeof radii;
  typography: typeof typography;
};

export function createTheme(colorScheme: ColorSchemeName): Theme {
  return {
    colorScheme,
    colors: palettes[colorScheme],
    spacing,
    radii,
    typography,
  };
}
