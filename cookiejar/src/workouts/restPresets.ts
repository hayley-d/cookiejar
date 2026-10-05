import { formatDuration } from '@/dates/formatDuration';

const secondsOnlyLimit = 120;

export const restPresetSeconds = [30, 45, 60, 90, 120, 180];

export function formatRestSeconds(restSeconds: number): string {
  return restSeconds < secondsOnlyLimit ? `${restSeconds}s` : formatDuration(restSeconds);
}

export const restPresetOptions = ['Off', ...restPresetSeconds.map(formatRestSeconds)];

export function restSecondsForPresetIndex(presetIndex: number): number | null | undefined {
  if (presetIndex === 0) {
    return null;
  }
  return restPresetSeconds[presetIndex - 1];
}
