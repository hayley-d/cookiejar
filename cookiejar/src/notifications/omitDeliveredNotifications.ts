import type { PlannedNotification } from '@/notifications/PlannedNotification';

export function omitDeliveredNotifications(
  plannedNotifications: readonly PlannedNotification[],
  deliveredIdentifiers: ReadonlySet<string>,
): PlannedNotification[] {
  return plannedNotifications.filter((plannedNotification) => !deliveredIdentifiers.has(plannedNotification.identifier));
}
