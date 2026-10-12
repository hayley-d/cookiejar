const metersPerHundred = 100;
const secondsPerMinute = 60;

export function deriveSecondsPerHundredMeters(durationSeconds: number, distanceMeters: number): number | null {
  if (distanceMeters <= 0 || durationSeconds <= 0) {
    return null;
  }
  return durationSeconds / (distanceMeters / metersPerHundred);
}

export function formatSwimPace(secondsPerHundredMeters: number): string {
  const totalSeconds = Math.round(secondsPerHundredMeters);
  const minutes = Math.floor(totalSeconds / secondsPerMinute);
  const seconds = totalSeconds % secondsPerMinute;
  return `${minutes}:${String(seconds).padStart(2, '0')} /100 m`;
}

export function describeSwimPace(durationSeconds: number, distanceMeters: number): string | null {
  const secondsPerHundredMeters = deriveSecondsPerHundredMeters(durationSeconds, distanceMeters);
  return secondsPerHundredMeters === null ? null : formatSwimPace(secondsPerHundredMeters);
}
