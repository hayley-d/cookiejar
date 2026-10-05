const secondsPerMinute = 60;

export function classRingProgress(elapsedSeconds: number, plannedDurationMinutes: number | null): number {
  if (plannedDurationMinutes === null || plannedDurationMinutes <= 0) {
    return 0;
  }
  const plannedSeconds = plannedDurationMinutes * secondsPerMinute;
  return Math.min(1, Math.max(0, elapsedSeconds / plannedSeconds));
}

export function plannedDurationLabel(plannedDurationMinutes: number | null): string | null {
  if (plannedDurationMinutes === null || plannedDurationMinutes <= 0) {
    return null;
  }
  return `of ${plannedDurationMinutes} min`;
}
