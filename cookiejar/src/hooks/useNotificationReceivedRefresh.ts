import { useEffect } from 'react';

import { isRecordedNotificationKind, notificationKindForIdentifier } from '@/notifications/notificationIdentifiers';
import { subscribeToReceivedNotificationIdentifiers } from '@/notifications/notificationReceived';
import { bumpDataVersion } from '@/stores/dataVersionStore';

export function useNotificationReceivedRefresh(): void {
  useEffect(
    () =>
      subscribeToReceivedNotificationIdentifiers((identifier) => {
        if (isRecordedNotificationKind(notificationKindForIdentifier(identifier))) {
          bumpDataVersion();
        }
      }),
    [],
  );
}
