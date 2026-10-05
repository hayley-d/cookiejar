const windowPaddingMilliseconds = 30 * 60 * 1000;

export type HealthWorkoutSearchWindow = {
  startDate: Date;
  endDate: Date;
};

export function healthWorkoutSearchWindow(
  startedAt: string,
  finishedAt: string | null,
  now: Date,
): HealthWorkoutSearchWindow {
  const sessionEndMilliseconds = finishedAt === null ? now.getTime() : new Date(finishedAt).getTime();
  return {
    startDate: new Date(new Date(startedAt).getTime() - windowPaddingMilliseconds),
    endDate: new Date(sessionEndMilliseconds + windowPaddingMilliseconds),
  };
}
