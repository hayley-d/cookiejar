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
  successSoft: string;
  successText: string;
  attention: string;
  attentionSoft: string;
  attentionText: string;
  danger: string;
  cardShadow: string;
  tabBar: string;
  chart: string;
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
    successSoft: '#DDF3E6',
    successText: '#1B7346',
    attention: '#C77A12',
    attentionSoft: '#FCEBCF',
    attentionText: '#8A5200',
    danger: '#D9534F',
    cardShadow: '#7FA9CC',
    tabBar: '#FFFFFF',
    chart: '#E0628F',
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
    successSoft: '#1F3B2E',
    successText: '#6FD39E',
    attention: '#F0B04A',
    attentionSoft: '#4A3818',
    attentionText: '#F0B04A',
    danger: '#E5675A',
    cardShadow: '#000000',
    tabBar: '#16233A',
    chart: '#E0628F',
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
  autoScrollEdge: 72,
  autoScrollStep: 8,
  exerciseEditorImage: 56,
  workoutRowImage: 72,
  toastIcon: 18,
  toastVerticalPadding: 12,
  supersetInfoNuggie: 140,
  coachButtonClearance: 96,
  createHubChevron: 14,
  setNumberColumn: 40,
  timeLabelColumn: 48,
  planEntryImage: 44,
  restDayNuggie: 44,
  planRowChevron: 14,
  dayChipCircle: 36,
  todayRingWidth: 2,
  dayMarkerSlot: 10,
  dayMarkerDot: 6,
  headerCardImageHeight: 200,
  headerCardNuggie: 140,
  detailBottomBarClearance: 96,
  setCompletionColumn: 44,
  sessionNotesMinimumHeight: 96,
  shakeDistance: 8,
  statTileMinimumHeight: 88,
  sessionClassNuggie: 140,
  restBarNuggie: 36,
  classRing: 220,
  classRingStroke: 12,
  countdownButtonHeight: 36,
  countdownButtonIcon: 14,
  minimumTouchTarget: 44,
  sessionTopBarSideSlot: 88,
  previousColumn: 72,
  coachButton: 64,
  tipBubbleMaximumWidth: 220,
  healthPermissionNuggie: 72,
  todayCardWidthRatio: 0.82,
  todayCardImageHeight: 180,
  todayCardNuggie: 120,
  todayCardActiveBorderWidth: 2,
  pageDot: 8,
  statTileIcon: 16,
  statTileRing: 28,
  statTileRingStroke: 4,
  statTileNuggie: 32,
  streakDot: 12,
  streakDotOutlineWidth: 2,
  statDayDateColumn: 88,
  progressChartHeight: 200,
  chartLineWidth: 2,
  chartGridLineWidth: 1,
  chartDot: 4,
  chartEmphasisedDot: 7,
  chartHighlightDot: 6,
  chartHighlightRing: 3,
  chartEdgePadding: 12,
  chartReferenceDash: 6,
  chartBarMaximumWidth: 24,
  chartBarWidthRatio: 0.7,
  chartBarCornerRadius: 4,
  coachAvatar: 36,
  typingDot: 8,
  chatBubbleMaximumWidth: 300,
  unreadDot: 10,
  bellUnreadDotInset: 10,
  notificationRowNuggie: 44,
  bellIcon: 24,
  rowDividerWidth: 1,
};

export const fontWeights = {
  regular: '400',
  heavy: '800',
} satisfies Record<string, TextStyle['fontWeight']>;

export const durations = {
  dragLongPress: 300,
  autoScrollInterval: 16,
  shakeStep: 50,
  timerTick: 1000,
  fastTimerTick: 250,
  bannerRefresh: 15000,
  typingDotPulse: 400,
  typingDotStagger: 150,
  tipBubbleVisible: 6000,
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
  fontWeights: typeof fontWeights;
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
    fontWeights,
    typography,
    shadows: createShadows(palettes[colorScheme]),
  };
}
