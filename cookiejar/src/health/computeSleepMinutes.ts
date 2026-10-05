import { isGarminSource } from '@/health/isGarminSource';

export type SleepSample = {
  startDate: Date;
  endDate: Date;
  stageValue: number;
  sourceName: string;
  bundleIdentifier: string;
};

const asleepStageValues = new Set([1, 3, 4, 5]);
const millisecondsPerMinute = 60_000;

export function computeSleepMinutes(samples: readonly SleepSample[]): number | null {
  const asleepSamples = samples.filter(
    (sample) => asleepStageValues.has(sample.stageValue) && sample.endDate.getTime() > sample.startDate.getTime(),
  );
  const garminSamples = asleepSamples.filter((sample) => isGarminSource(sample));
  const preferredSamples = garminSamples.length > 0 ? garminSamples : asleepSamples;
  if (preferredSamples.length === 0) {
    return null;
  }

  const sortedIntervals = preferredSamples
    .map((sample) => ({ start: sample.startDate.getTime(), end: sample.endDate.getTime() }))
    .sort((first, second) => first.start - second.start);

  let totalMilliseconds = 0;
  let currentStart = sortedIntervals[0].start;
  let currentEnd = sortedIntervals[0].end;
  for (const interval of sortedIntervals.slice(1)) {
    if (interval.start <= currentEnd) {
      currentEnd = Math.max(currentEnd, interval.end);
    } else {
      totalMilliseconds += currentEnd - currentStart;
      currentStart = interval.start;
      currentEnd = interval.end;
    }
  }
  totalMilliseconds += currentEnd - currentStart;

  return Math.round(totalMilliseconds / millisecondsPerMinute);
}
