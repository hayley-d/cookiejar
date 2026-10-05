import type { WeeklyStreakDay, WeeklyStreakDayState } from '@/progress/calculateWeeklyStreak';

const stateDescriptions: Record<WeeklyStreakDayState, string> = {
  completed: 'done',
  unplanned: 'done',
  pending: 'to do',
  missed: 'missed',
  rest: 'rest',
};

export function describeStreakDays(days: readonly WeeklyStreakDay[]): string {
  return days.map((day) => stateDescriptions[day.state]).join(', ');
}
