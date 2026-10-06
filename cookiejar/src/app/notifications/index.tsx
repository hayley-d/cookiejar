import { type Href, router, Stack } from "expo-router";

import { TextButton } from "@/components/atoms/TextButton";
import { EmptyState } from "@/components/molecules/EmptyState";
import { NotificationList } from "@/components/organisms/NotificationList";
import { useNotifications } from "@/hooks/useNotifications";
import type { AppNotification } from "@/types/AppNotification";

export default function NotificationsScreen() {
  const { notifications, hasLoadFailed, markRead, markAllRead } =
    useNotifications();

  if (notifications === null) {
    return hasLoadFailed ? (
      <EmptyState
        title="Could not load notifications"
        message="Something went wrong. Please try again."
      />
    ) : null;
  }

  const hasUnread = notifications.some(
    (notification) => notification.readAt === null,
  );

  const openNotification = (notification: AppNotification) => {
    markRead(notification.id).catch(() => {});
    if (notification.route !== null) {
      router.push(notification.route as Href);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: hasUnread
            ? () => (
                <TextButton
                  label="Mark all read"
                  onPress={() => markAllRead().catch(() => {})}
                />
              )
            : undefined,
        }}
      />
      <NotificationList
        notifications={notifications}
        now={new Date()}
        onPressNotification={openNotification}
      />
    </>
  );
}
