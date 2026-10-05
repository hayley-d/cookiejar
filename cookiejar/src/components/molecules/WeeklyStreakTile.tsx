import { StreakDots } from '@/components/atoms/StreakDots';
import { StatTile } from '@/components/molecules/StatTile';
import { chooseNuggie } from '@/nuggies/chooseNuggie';
import type { WeeklyStreak } from '@/progress/calculateWeeklyStreak';
import { describeStreakDays } from '@/progress/describeStreakDays';
import { statsDetailHint } from '@/stats/statsDetail';

type WeeklyStreakTileProperties = {
  streak: WeeklyStreak | null;
  isTargetMet: boolean;
  now: Date;
  onPress?: () => void;
};

export function WeeklyStreakTile({ streak, isTargetMet, now, onPress }: WeeklyStreakTileProperties) {
  if (streak === null) {
    return (
      <StatTile
        icon="flame.fill"
        label="This week"
        value="—"
        caption="No data yet"
        onPress={onPress}
        accessibilityHint={statsDetailHint}
      />
    );
  }

  return (
    <StatTile
      icon="flame.fill"
      label="This week"
      value={`${streak.completedCount} / ${streak.plannedCount}`}
      accessory={<StreakDots days={streak.days} />}
      tone={isTargetMet ? 'positive' : 'default'}
      nuggie={isTargetMet ? chooseNuggie({ kind: 'weeklyTargetMet' }, now) : undefined}
      onPress={onPress}
      accessibilityHint={statsDetailHint}
      accessibilityDetail={describeStreakDays(streak.days)}
    />
  );
}
