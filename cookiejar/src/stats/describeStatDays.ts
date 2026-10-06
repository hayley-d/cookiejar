import { formatShortDate } from '@/dates/formatShortDate';
import { compareToAverage } from '@/health/compareToAverage';
import { formatRestingHeartRate } from '@/health/formatRestingHeartRate';
import { formatSleepMinutes } from '@/health/formatSleepMinutes';
import { formatSteps, missingHealthValue } from '@/health/formatSteps';
import { shortSleepMinutes } from '@/health/sleepThresholds';
import type { WeeklyStreakDay } from '@/progress/calculateWeeklyStreak';
import { readHealthMetricValue } from '@/stats/healthChartPoints';
import type { HealthStatsMetric } from '@/stats/parseStatsMetric';
import type { HealthSnapshot } from '@/types/HealthSnapshot';
import type { ScheduledWorkout } from '@/types/ScheduledWorkout';

export type StatDayTone = 'default' | 'positive' | 'attention';

export type StatDayDetail = {
  text: string;
  tone: StatDayTone;
  description: string;
};

export type StatDay = {
  date: string;
  dateLabel: string;
  valueText: string;
  valueTone: StatDayTone;
  detail: StatDayDetail | null;
  workoutDots: WeeklyStreakDay[];
};

const minusSign = '−';

export function healthMetricValues(
  metric: HealthStatsMetric,
  dates: readonly string[],
  snapshotsByDate: ReadonlyMap<string, HealthSnapshot>,
): (number | null)[] {
  return dates.map((date) => {
    const snapshot = snapshotsByDate.get(date);
    return snapshot === undefined ? null : readHealthMetricValue(metric, snapshot);
  });
}

export function formatSignedDifference(difference: number): string {
  if (difference > 0) {
    return `+${difference}`;
  }
  if (difference < 0) {
    return `${minusSign}${Math.abs(difference)}`;
  }
  return '0';
}

function describeHealthDetail(
  metric: HealthStatsMetric,
  value: number,
  presentValues: readonly number[],
  dailyStepGoal: number,
): StatDayDetail | null {
  if (metric === 'steps') {
    return value >= dailyStepGoal ? { text: '✓', tone: 'positive', description: 'goal reached' } : null;
  }
  if (metric === 'sleep') {
    return value < shortSleepMinutes ? { text: 'Short', tone: 'attention', description: 'short night' } : null;
  }
  const comparison = compareToAverage(value, presentValues);
  if (comparison === null) {
    return null;
  }
  const absoluteDifference = Math.abs(comparison.difference);
  return {
    text: formatSignedDifference(comparison.difference),
    tone: comparison.tone,
    description:
      comparison.direction === 'level'
        ? 'at your average'
        : `${absoluteDifference} ${comparison.direction === 'up' ? 'above' : 'below'} your average`,
  };
}

const healthValueFormatters: Record<HealthStatsMetric, (value: number | null) => string> = {
  steps: formatSteps,
  sleep: formatSleepMinutes,
  restingHeartRate: formatRestingHeartRate,
};

export function describeHealthStatDays(
  metric: HealthStatsMetric,
  datesNewestFirst: readonly string[],
  snapshotsByDate: ReadonlyMap<string, HealthSnapshot>,
  dailyStepGoal: number,
): StatDay[] {
  const values = healthMetricValues(metric, datesNewestFirst, snapshotsByDate);
  const presentValues = values.filter((value): value is number => value !== null);
  return datesNewestFirst.map((date, index) => {
    const value = values[index];
    const detail = value === null ? null : describeHealthDetail(metric, value, presentValues, dailyStepGoal);
    return {
      date,
      dateLabel: formatShortDate(date),
      valueText: healthValueFormatters[metric](value),
      valueTone: metric === 'sleep' && detail !== null ? detail.tone : 'default',
      detail,
      workoutDots: [],
    };
  });
}

function workoutDotsFor(date: string, today: string, scheduledWorkouts: readonly ScheduledWorkout[]): WeeklyStreakDay[] {
  return scheduledWorkouts
    .filter((scheduledWorkout) => scheduledWorkout.status === 'completed' || scheduledWorkout.planEntryId !== null)
    .map((scheduledWorkout, index) => ({
      date: `${date}-${index}`,
      state: scheduledWorkout.status === 'completed' ? 'completed' : date < today ? 'missed' : 'pending',
    }));
}

export function describeStreakStatDays(
  datesNewestFirst: readonly string[],
  scheduledWorkoutsByDate: ReadonlyMap<string, readonly ScheduledWorkout[]> | null,
  today: string,
): StatDay[] {
  return datesNewestFirst.map((date) => {
    const workoutDots =
      scheduledWorkoutsByDate === null ? [] : workoutDotsFor(date, today, scheduledWorkoutsByDate.get(date) ?? []);
    const completedCount = workoutDots.filter((dot) => dot.state === 'completed').length;
    const hasMissedWorkout = workoutDots.some((dot) => dot.state === 'missed');
    return {
      date,
      dateLabel: formatShortDate(date),
      valueText:
        scheduledWorkoutsByDate === null
          ? missingHealthValue
          : workoutDots.length === 0
            ? 'Rest'
            : `${completedCount} / ${workoutDots.length}`,
      valueTone: hasMissedWorkout ? 'attention' : completedCount > 0 ? 'positive' : 'default',
      detail: null,
      workoutDots,
    };
  });
}
