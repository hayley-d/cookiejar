import { nextSundayAtSeven } from '@/notifications/nextSundayAtSeven';
import { notificationsConfiguration } from '@/notifications/notificationsConfiguration';
import { weeklySummaryIdentifier } from '@/notifications/notificationIdentifiers';
import type { PlannedNotification } from '@/notifications/PlannedNotification';
import { toLocalDateString } from '@/dates/toLocalDateString';

type WeeklySummaryInput = {
  completedCount: number;
  plannedCount: number;
  recordCount: number;
  now: Date;
};

function workoutsText(completedCount: number, plannedCount: number): string {
  if (plannedCount > 0) {
    return `This week: ${completedCount}/${plannedCount} workouts`;
  }
  return `This week: ${completedCount} ${completedCount === 1 ? 'workout' : 'workouts'} done`;
}

function recordsText(recordCount: number): string {
  if (recordCount === 0) {
    return ' 💪';
  }
  return `, ${recordCount} new ${recordCount === 1 ? 'record' : 'records'} 🏆`;
}

export function weeklySummaryBody({ completedCount, plannedCount, recordCount }: Omit<WeeklySummaryInput, 'now'>) {
  if (plannedCount === 0 && completedCount === 0) {
    return notificationsConfiguration.restWeekSummaryBody;
  }
  return `${workoutsText(completedCount, plannedCount)}${recordsText(recordCount)}`;
}

export function buildWeeklySummary(input: WeeklySummaryInput): PlannedNotification {
  const fireAt = nextSundayAtSeven(input.now);
  return {
    identifier: weeklySummaryIdentifier(toLocalDateString(fireAt)),
    title: notificationsConfiguration.weeklySummaryTitle,
    body: weeklySummaryBody(input),
    nuggie: 'coach',
    route: '/coach',
    fireAt,
    playsSound: true,
  };
}
