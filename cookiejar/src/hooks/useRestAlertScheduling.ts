import { useSQLiteContext } from 'expo-sqlite';
import { useEffect } from 'react';

import { getActiveSession } from '@/database/repositories/sessionRepository';
import { loadNotificationSettings } from '@/hooks/loadNotificationSettings';
import { mapRestTimerChange } from '@/notifications/mapRestTimerChange';
import { getNotificationPermissionStatus } from '@/notifications/notificationPermission';
import { cancelRestTimerNotification, scheduleRestTimerNotification } from '@/notifications/notificationScheduling';
import { reportNotificationError } from '@/notifications/reportNotificationError';
import { routeToHref } from '@/notifications/routeToHref';
import type { RestTimerState } from '@/sessions/restTimerState';
import { getRestTimerState, subscribeToRestTimer } from '@/stores/restTimerStore';

export function useRestAlertScheduling(): void {
  const database = useSQLiteContext();

  useEffect(() => {
    let previousState: RestTimerState = getRestTimerState();
    let pendingWork: Promise<void> = Promise.resolve();

    const scheduleRestAlert = async (changedState: RestTimerState, seconds: number) => {
      const settings = await loadNotificationSettings(database);
      if (!settings.areRestAlertsEnabled) {
        return;
      }
      if ((await getNotificationPermissionStatus()) !== 'granted') {
        return;
      }
      const activeSession = await getActiveSession(database);
      if (getRestTimerState() !== changedState) {
        return;
      }
      const sessionRoute =
        activeSession === null
          ? null
          : routeToHref({ pathname: '/sessions/[sessionId]', params: { sessionId: String(activeSession.id) } });
      await scheduleRestTimerNotification(seconds, sessionRoute);
    };

    const unsubscribe = subscribeToRestTimer(() => {
      const changedState = getRestTimerState();
      const action = mapRestTimerChange(previousState, changedState, Date.now());
      previousState = changedState;
      if (action.kind === 'nothing') {
        return;
      }
      pendingWork = pendingWork
        .then(() =>
          action.kind === 'schedule' ? scheduleRestAlert(changedState, action.seconds) : cancelRestTimerNotification(),
        )
        .catch(reportNotificationError);
    });

    return unsubscribe;
  }, [database]);
}
