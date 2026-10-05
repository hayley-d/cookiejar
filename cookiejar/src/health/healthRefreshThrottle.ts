const lastRefreshStartedAtByDate = new Map<string, number>();

export function getLastRefreshStartedAt(date: string): number | null {
  return lastRefreshStartedAtByDate.get(date) ?? null;
}

export function markRefreshStarted(date: string, startedAt: number): void {
  lastRefreshStartedAtByDate.set(date, startedAt);
}

export function clearRefreshStarted(date: string): void {
  lastRefreshStartedAtByDate.delete(date);
}
