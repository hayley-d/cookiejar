import { describe, expect, test } from 'bun:test';

import { omitDeliveredNotifications } from '@/notifications/omitDeliveredNotifications';
import type { PlannedNotification } from '@/notifications/PlannedNotification';

function makePlannedNotification(identifier: string): PlannedNotification {
  return {
    identifier,
    title: 'Title',
    body: 'Body',
    nuggie: 'notification',
    route: null,
    fireAt: new Date(2026, 9, 7, 9, 0),
    playsSound: true,
  };
}

describe('omitDeliveredNotifications', () => {
  test('drops planned notifications whose identifier was already delivered', () => {
    const planned = [
      makePlannedNotification('workout-reminder:2026-10-07:1'),
      makePlannedNotification('workout-reminder:2026-10-07:2'),
    ];
    const result = omitDeliveredNotifications(planned, new Set(['workout-reminder:2026-10-07:1']));
    expect(result.map((plannedNotification) => plannedNotification.identifier)).toEqual([
      'workout-reminder:2026-10-07:2',
    ]);
  });

  test('keeps everything when nothing was delivered', () => {
    const planned = [makePlannedNotification('weekly-summary:2026-10-11')];
    expect(omitDeliveredNotifications(planned, new Set())).toEqual(planned);
  });
});
