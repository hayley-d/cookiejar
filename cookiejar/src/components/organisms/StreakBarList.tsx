import { StatBarList } from '@/components/organisms/StatBarList';
import { formatShortDate } from '@/dates/formatShortDate';
import { useScheduledWorkouts } from '@/hooks/useScheduledWorkouts';
import { countScheduledWorkouts } from '@/progress/calculateWeeklyStreak';
import { barFraction } from '@/stats/barFraction';

type StreakBarListProperties = {
  startDate: string;
  endDate: string;
  datesNewestFirst: readonly string[];
};

export function StreakBarList({ startDate, endDate, datesNewestFirst }: StreakBarListProperties) {
  const lookup = useScheduledWorkouts(startDate, endDate);
  const scheduledWorkoutsByDate = lookup.status === 'ready' ? lookup.scheduledWorkoutsByDate : null;
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
