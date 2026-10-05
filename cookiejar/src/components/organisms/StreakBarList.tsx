import { StatBarList } from '@/components/organisms/StatBarList';
import { formatShortDate } from '@/dates/formatShortDate';
import { countScheduledWorkouts } from '@/progress/calculateWeeklyStreak';
import { barFraction } from '@/stats/barFraction';
import type { ScheduledWorkout } from '@/types/ScheduledWorkout';

type StreakBarListProperties = {
  datesNewestFirst: readonly string[];
  scheduledWorkoutsByDate: ReadonlyMap<string, readonly ScheduledWorkout[]> | null;
};

export function StreakBarList({ datesNewestFirst, scheduledWorkoutsByDate }: StreakBarListProperties) {
  const rows = datesNewestFirst.map((date) => {
    const { completedCount, plannedCount } = countScheduledWorkouts(scheduledWorkoutsByDate?.get(date) ?? []);
    return {
      date,
      dateLabel: formatShortDate(date),
      valueText: scheduledWorkoutsByDate === null ? '—' : `${completedCount} / ${plannedCount}`,
      fraction: barFraction(completedCount, plannedCount),
    };
  });

  return <StatBarList rows={rows} />;
}
