import { View } from 'react-native';

import { Typography } from '@/components/primitives/Typography';
import type { WeeklyStreakDay, WeeklyStreakDayState } from '@/progress/calculateWeeklyStreak';
import { useTheme } from '@/theme/useTheme';

type StreakDotsProperties = {
  days: readonly WeeklyStreakDay[];
};

const stateDescriptions: Record<WeeklyStreakDayState, string> = {
  completed: 'done',
  unplanned: 'done',
  pending: 'to do',
  missed: 'missed',
  rest: 'rest',
};

export function StreakDots({ days }: StreakDotsProperties) {
  const theme = useTheme();
  const dotSize = theme.sizes.streakDot;

  const renderDot = (day: WeeklyStreakDay) => {
    if (day.state === 'rest') {
      return (
        <View
          key={day.date}
          style={{ width: dotSize, height: dotSize, alignItems: 'center', justifyContent: 'center' }}
        >
          <Typography variant="caption" color="textSecondary" style={{ lineHeight: dotSize }}>
            ·
          </Typography>
        </View>
      );
    }
    const isFilled = day.state === 'completed' || day.state === 'unplanned';
    return (
      <View
        key={day.date}
        style={{
          width: dotSize,
          height: dotSize,
          borderRadius: theme.radii.round,
          backgroundColor: isFilled
            ? theme.colors.accent
            : day.state === 'missed'
              ? theme.colors.textSecondary
              : undefined,
          borderWidth: day.state === 'pending' ? theme.sizes.streakDotOutlineWidth : 0,
          borderColor: theme.colors.accent,
        }}
      />
    );
  };

  return (
    <View
      accessible
      accessibilityLabel={days.map((day) => stateDescriptions[day.state]).join(', ')}
      style={{ flexDirection: 'row', alignItems: 'center', gap: theme.spacing.extraSmall }}
    >
      {days.map(renderDot)}
    </View>
  );
}
