const secondsPerMinute = 60;

export function formatSwimTime(totalSeconds: number): string {
  const wholeSeconds = Math.max(0, Math.round(totalSeconds));
  const minutes = Math.floor(wholeSeconds / secondsPerMinute);
  const seconds = wholeSeconds % secondsPerMinute;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}
