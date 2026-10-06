import { EmptyState } from "@/components/molecules/EmptyState";
import { NotificationRow } from "@/components/molecules/NotificationRow";
import { List } from "@/components/primitives/List";
import type { AppNotification } from "@/types/AppNotification";

type NotificationListProperties = {
  notifications: AppNotification[];
  now: Date;
  onPressNotification: (notification: AppNotification) => void;
};

export function NotificationList({
  notifications,
  now,
  onPressNotification,
}: NotificationListProperties) {
  if (notifications.length === 0) {
    return (
      <EmptyState
        nuggie="notification"
        title="All caught up!"
        message="Nuggie will let you know when something's up."
      />
    );
  }

  return (
    <List
      data={notifications}
      keyExtractor={(notification) => String(notification.id)}
      gap="none"
      renderItem={({ item }) => (
        <NotificationRow
          notification={item}
          now={now}
          onPress={onPressNotification}
        />
      )}
    />
  );
}
