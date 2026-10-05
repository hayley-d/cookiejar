export const healthRefreshWindowMilliseconds = 5 * 60 * 1000;

export function shouldRefreshHealth(lastRefreshStartedAt: number | null, now: number): boolean {
  if (lastRefreshStartedAt === null) {
    return true;
  }
  const elapsedMilliseconds = now - lastRefreshStartedAt;
  return elapsedMilliseconds < 0 || elapsedMilliseconds >= healthRefreshWindowMilliseconds;
}
