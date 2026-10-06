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

const hidden: ForegroundPresentation = {
  shouldShowBanner: false,
  shouldShowList: false,
  shouldPlaySound: false,
  shouldSetBadge: false,
};

const foregroundPresentationByKind: Record<NotificationKind, ForegroundPresentation> = {
  workoutReminder: shownWithSound,
  restTimer: hidden,
  other: shownWithSound,
};

export function foregroundPresentationFor(kind: NotificationKind): ForegroundPresentation {
  return foregroundPresentationByKind[kind];
}
