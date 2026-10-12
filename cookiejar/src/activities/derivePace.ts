const metersPerKilometer = 1000;
const secondsPerMinute = 60;

export function derivePaceSecondsPerKilometer(
  distanceMeters: number | null,
  durationSeconds: number | null,
): number | null {
  if (distanceMeters === null || durationSeconds === null || distanceMeters <= 0 || durationSeconds <= 0) {
    return null;
  }
  return durationSeconds / (distanceMeters / metersPerKilometer);
}

export function formatPace(secondsPerKilometer: number): string {
  const totalSeconds = Math.round(secondsPerKilometer);
  const minutes = Math.floor(totalSeconds / secondsPerMinute);
  const seconds = totalSeconds % secondsPerMinute;
  return `${minutes}:${String(seconds).padStart(2, '0')} /km`;
}

export function describePace(distanceMeters: number | null, durationSeconds: number | null): string | null {
  const secondsPerKilometer = derivePaceSecondsPerKilometer(distanceMeters, durationSeconds);
  return secondsPerKilometer === null ? null : formatPace(secondsPerKilometer);
}
