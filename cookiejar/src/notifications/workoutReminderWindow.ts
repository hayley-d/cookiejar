import { addDays } from '@/dates/addDays';
import { toLocalDateString } from '@/dates/toLocalDateString';

export const workoutReminderWindowDayCount = 14;

export type WorkoutReminderWindow = {
  startDate: string;
  endDate: string;
};

export function workoutReminderWindow(now: Date): WorkoutReminderWindow {
  return {
    startDate: toLocalDateString(now),
    endDate: toLocalDateString(addDays(now, workoutReminderWindowDayCount - 1)),
  };
}
