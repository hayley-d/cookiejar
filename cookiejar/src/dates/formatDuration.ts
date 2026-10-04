const secondsPerMinute = 60;
const secondsPerHour = 3600;

export function formatDuration(seconds: number): string {
  const totalSeconds = Math.max(0, Math.round(seconds));
  const hours = Math.floor(totalSeconds / secondsPerHour);
  const minutes = Math.floor((totalSeconds % secondsPerHour) / secondsPerMinute);
  const remainingSeconds = totalSeconds % secondsPerMinute;

  const parts: string[] = [];
  if (hours > 0) {
    parts.push(`${hours}h`);
  }
  if (minutes > 0) {
    parts.push(`${minutes}m`);
  }
  if (remainingSeconds > 0 || parts.length === 0) {
    parts.push(`${remainingSeconds}s`);
  }

  return parts.join(' ');
}
