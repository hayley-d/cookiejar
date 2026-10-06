export function reportNotificationError(error: unknown): void {
  if (__DEV__) {
    console.warn('Notification error', error);
  }
}
