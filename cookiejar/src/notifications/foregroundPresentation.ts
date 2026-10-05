import type { NotificationKind } from '@/notifications/notificationIdentifiers';

export type ForegroundPresentation = {
  shouldShowBanner: boolean;
  shouldShowList: boolean;
  shouldPlaySound: boolean;
  shouldSetBadge: boolean;
};

const shownWithSound: ForegroundPresentation = {
  shouldShowBanner: true,
  shouldShowList: true,
  shouldPlaySound: true,
  shouldSetBadge: false,
};

const foregroundPresentationByKind: Record<NotificationKind, ForegroundPresentation> = {
  workoutReminder: shownWithSound,
  other: shownWithSound,
};

export function foregroundPresentationFor(kind: NotificationKind): ForegroundPresentation {
  return foregroundPresentationByKind[kind];
}
