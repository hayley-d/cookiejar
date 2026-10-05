import { StreakDots } from '@/components/atoms/StreakDots';
import { StatTile } from '@/components/molecules/StatTile';
import { chooseNuggie } from '@/nuggies/chooseNuggie';
import type { WeeklyStreak } from '@/progress/calculateWeeklyStreak';

type WeeklyStreakTileProperties = {
  streak: WeeklyStreak | null;
  isTargetMet: boolean;
  now: Date;
};

export function WeeklyStreakTile({ streak, isTargetMet, now }: WeeklyStreakTileProperties) {
  if (streak === null) {
    return <StatTile icon="flame.fill" label="This week" value="—" caption="No data yet" />;
  }

  return (
    <StatTile
      icon="flame.fill"
      label="This week"
      value={`${streak.completedCount} / ${streak.plannedCount}`}
      accessory={<StreakDots days={streak.days} />}
      tone={isTargetMet ? 'positive' : 'default'}
      nuggie={isTargetMet ? chooseNuggie({ kind: 'weeklyTargetMet' }, now) : undefined}
    />
  );
}
