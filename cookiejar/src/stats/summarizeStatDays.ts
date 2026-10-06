import { formatShortDate } from '@/dates/formatShortDate';
import { formatRestingHeartRate } from '@/health/formatRestingHeartRate';
import { formatSleepMinutes } from '@/health/formatSleepMinutes';
import { formatSteps } from '@/health/formatSteps';
import { shortSleepMinutes } from '@/health/sleepThresholds';
import type { HealthStatsMetric } from '@/stats/parseStatsMetric';
import type { StatDay } from '@/stats/describeStatDays';

export type StatSummaryItem = {
  label: string;
  value: string;
  caption?: string;
};

type DatedValue = {
  date: string;
  value: number;
};

function presentDatedValues(dates: readonly string[], values: readonly (number | null)[]): DatedValue[] {
  const datedValues: DatedValue[] = [];
  dates.forEach((date, index) => {
    const value = values[index];
    if (value !== null && value !== undefined) {
      datedValues.push({ date, value });
    }
  });
  return datedValues;
}

function averageOf(datedValues: readonly DatedValue[]): number {
  return datedValues.reduce((total, datedValue) => total + datedValue.value, 0) / datedValues.length;
}

function highestOf(datedValues: readonly DatedValue[]): DatedValue {
  return datedValues.reduce((highest, datedValue) => (datedValue.value > highest.value ? datedValue : highest));
}

function lowestOf(datedValues: readonly DatedValue[]): DatedValue {
  return datedValues.reduce((lowest, datedValue) => (datedValue.value < lowest.value ? datedValue : lowest));
}

export function summarizeHealthMetric(
  metric: HealthStatsMetric,
  dates: readonly string[],
  values: readonly (number | null)[],
  dailyStepGoal: number,
): StatSummaryItem[] {
  const datedValues = presentDatedValues(dates, values);
  if (datedValues.length === 0) {
    return [];
  }
  const average = averageOf(datedValues);
  const highest = highestOf(datedValues);
  const lowest = lowestOf(datedValues);
  const dayCount = datedValues.length;

  if (metric === 'steps') {
    const goalDayCount = datedValues.filter((datedValue) => datedValue.value >= dailyStepGoal).length;
    return [
      { label: 'Average', value: formatSteps(average) },
      { label: 'Best day', value: formatSteps(highest.value), caption: formatShortDate(highest.date) },
      { label: 'Goal reached', value: `${goalDayCount} / ${dayCount}`, caption: 'days' },
    ];
  }
  if (metric === 'sleep') {
    const shortNightCount = datedValues.filter((datedValue) => datedValue.value < shortSleepMinutes).length;
    return [
      { label: 'Average', value: formatSleepMinutes(average) },
      { label: 'Longest', value: formatSleepMinutes(highest.value), caption: formatShortDate(highest.date) },
      { label: 'Under 6h', value: `${shortNightCount} / ${dayCount}`, caption: 'nights' },
    ];
  }
  return [
    { label: 'Average', value: formatRestingHeartRate(average) },
    { label: 'Lowest', value: formatRestingHeartRate(lowest.value), caption: formatShortDate(lowest.date) },
    { label: 'Highest', value: formatRestingHeartRate(highest.value), caption: formatShortDate(highest.date) },
  ];
}

export function summarizeStreakDays(statDays: readonly StatDay[]): StatSummaryItem[] {
  const allDots = statDays.flatMap((statDay) => statDay.workoutDots);
  const completedCount = allDots.filter((dot) => dot.state === 'completed').length;
  const missedCount = allDots.filter((dot) => dot.state === 'missed').length;
  const trainedDayCount = statDays.filter((statDay) =>
    statDay.workoutDots.some((dot) => dot.state === 'completed'),
  ).length;
  return [
    { label: 'Completed', value: `${completedCount} / ${allDots.length}`, caption: 'workouts' },
    { label: 'Days trained', value: String(trainedDayCount) },
    { label: 'Missed', value: String(missedCount) },
  ];
}
