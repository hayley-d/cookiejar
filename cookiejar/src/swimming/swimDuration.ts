const millisecondsPerSecond = 1000;

export function defaultSwimDurationSeconds(startedAt: string, now: Date): number {
  const elapsedMilliseconds = now.getTime() - new Date(startedAt).getTime();
  if (!Number.isFinite(elapsedMilliseconds)) {
    return 0;
  }
  return Math.max(0, Math.round(elapsedMilliseconds / millisecondsPerSecond));
}

export function swimFinishedAt(startedAt: string, durationSeconds: number): string {
  return new Date(new Date(startedAt).getTime() + durationSeconds * millisecondsPerSecond).toISOString();
}
