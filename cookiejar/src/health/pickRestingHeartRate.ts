export type RestingHeartRateSample = {
  startDate: Date;
  beatsPerMinute: number;
};

export function pickRestingHeartRate(
  samples: readonly RestingHeartRateSample[],
  dayStart: Date,
  dayEnd: Date,
): number | null {
  let latestSample: RestingHeartRateSample | null = null;
  for (const sample of samples) {
    const startTime = sample.startDate.getTime();
    if (startTime < dayStart.getTime() || startTime >= dayEnd.getTime()) {
      continue;
    }
    if (latestSample === null || startTime > latestSample.startDate.getTime()) {
      latestSample = sample;
    }
  }
  return latestSample === null ? null : Math.round(latestSample.beatsPerMinute);
}
