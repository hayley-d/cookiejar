import { useSQLiteContext } from 'expo-sqlite';
import { useEffect } from 'react';
import { AppState } from 'react-native';

import { reconcileNotifications } from '@/hooks/reconcileNotifications';
import { createQueuedRunner } from '@/notifications/createQueuedRunner';
import { notificationsConfiguration } from '@/notifications/notificationsConfiguration';
import { reportNotificationError } from '@/notifications/reportNotificationError';
import { subscribeToDataVersion } from '@/stores/dataVersionStore';

export function useNotificationReconciler(): void {
  const database = useSQLiteContext();

  useEffect(() => {
    let isMounted = true;
    let debounceTimeout: ReturnType<typeof setTimeout> | null = null;

    const requestRun = createQueuedRunner(async () => {
      if (isMounted) {
        await reconcileNotifications(database);
      }
    }, reportNotificationError);

    const clearDebounce = () => {
      if (debounceTimeout !== null) {
        clearTimeout(debounceTimeout);
        debounceTimeout = null;
      }
    };

    requestRun().catch(() => {});

    const unsubscribeFromDataVersion = subscribeToDataVersion(() => {
      clearDebounce();
      debounceTimeout = setTimeout(() => {
        debounceTimeout = null;
        requestRun().catch(() => {});
      }, notificationsConfiguration.reconcileDebounceMilliseconds);
    });

    const appStateSubscription = AppState.addEventListener('change', (appState) => {
      if (appState === 'active') {
        requestRun().catch(() => {});
      }
    });

    return () => {
      isMounted = false;
      clearDebounce();
      unsubscribeFromDataVersion();
      appStateSubscription.remove();
    };
  }, [database]);
}
