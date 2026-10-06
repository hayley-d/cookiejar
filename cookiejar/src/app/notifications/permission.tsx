import { router } from 'expo-router';
import { useRef, useState } from 'react';

import { NotificationPermissionSheet } from '@/components/organisms/NotificationPermissionSheet';
import { requestNotificationPermission } from '@/notifications/notificationPermission';
import { bumpDataVersion } from '@/stores/dataVersionStore';

export default function NotificationPermissionScreen() {
  const [isRequesting, setIsRequesting] = useState(false);
  const isRequestInFlight = useRef(false);

  const continueToPermissionPrompt = async () => {
    if (isRequestInFlight.current) {
      return;
    }
    isRequestInFlight.current = true;
    setIsRequesting(true);
    try {
      await requestNotificationPermission();
    } finally {
      router.back();
      bumpDataVersion();
    }
  };

  return (
    <NotificationPermissionSheet
      onContinue={continueToPermissionPrompt}
      onDismiss={() => router.back()}
      isRequesting={isRequesting}
    />
  );
}
