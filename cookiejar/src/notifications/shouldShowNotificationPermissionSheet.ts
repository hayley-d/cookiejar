import type { NotificationPermissionStatus } from '@/notifications/NotificationPermissionStatus';

type NotificationPermissionSheetInput = {
  sheetShownAt: string | null;
  permissionStatus: NotificationPermissionStatus;
};

export function shouldShowNotificationPermissionSheet({
  sheetShownAt,
  permissionStatus,
}: NotificationPermissionSheetInput): boolean {
  return sheetShownAt === null && permissionStatus === 'undetermined';
}
