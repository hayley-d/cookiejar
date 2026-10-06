export function readNotificationRoute(data: unknown): string | null {
  if (typeof data !== 'object' || data === null) {
    return null;
  }
  const route = (data as Record<string, unknown>).route;
  return typeof route === 'string' && route.startsWith('/') ? route : null;
}
