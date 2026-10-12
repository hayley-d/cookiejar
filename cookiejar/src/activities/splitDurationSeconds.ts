const secondsPerMinute = 60;
const minutesPerHour = 60;

export type DurationParts = {
  hours: number | null;
  minutes: number | null;
};

export function splitDurationSeconds(durationSeconds: number): DurationParts {
  const totalMinutes = Math.max(0, Math.round(durationSeconds / secondsPerMinute));
  const hours = Math.floor(totalMinutes / minutesPerHour);
  const minutes = totalMinutes % minutesPerHour;
  return { hours: hours === 0 ? null : hours, minutes: minutes === 0 ? null : minutes };
}
