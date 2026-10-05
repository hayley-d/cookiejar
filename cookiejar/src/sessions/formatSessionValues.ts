const secondsPerMinute = 60;
const secondsPerHour = 3600;
const minutesPerHour = 60;

function padToTwoDigits(value: number) {
  return String(value).padStart(2, '0');
}

export function formatElapsedTime(elapsedSeconds: number): string {
  const totalSeconds = Math.max(0, Math.floor(elapsedSeconds));
  const hours = Math.floor(totalSeconds / secondsPerHour);
  const minutes = Math.floor((totalSeconds % secondsPerHour) / secondsPerMinute);
  const seconds = totalSeconds % secondsPerMinute;
  return `${padToTwoDigits(hours)}:${padToTwoDigits(minutes)}:${padToTwoDigits(seconds)}`;
}

export function formatSessionDuration(durationSeconds: number): string {
  const totalMinutes = Math.max(0, Math.round(durationSeconds / secondsPerMinute));
  if (totalMinutes < minutesPerHour) {
    return `${totalMinutes} min`;
  }
  const hours = Math.floor(totalMinutes / minutesPerHour);
  const minutes = totalMinutes % minutesPerHour;
  return minutes === 0 ? `${hours} h` : `${hours} h ${minutes} min`;
}

function groupThousands(wholeNumber: number): string {
  return String(wholeNumber).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function formatVolume(volumeKilograms: number): string {
  return `${groupThousands(Math.max(0, Math.round(volumeKilograms)))} kg`;
}

export function formatSetCount(setCount: number): string {
  return `${setCount} ${setCount === 1 ? 'set' : 'sets'}`;
}
