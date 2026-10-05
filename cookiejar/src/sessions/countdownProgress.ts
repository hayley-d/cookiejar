const millisecondsPerSecond = 1000;

export type CountdownPlan = { direction: 'down'; startSeconds: number } | { direction: 'up' };

export function planCountdown(targetSeconds: number | null): CountdownPlan {
  if (targetSeconds === null || targetSeconds <= 0) {
    return { direction: 'up' };
  }
  return { direction: 'down', startSeconds: targetSeconds };
}

export function elapsedSecondsSince(startedAtMilliseconds: number, nowMilliseconds: number): number {
  return Math.max(0, Math.floor((nowMilliseconds - startedAtMilliseconds) / millisecondsPerSecond));
}

export function displayedCountdownSeconds(plan: CountdownPlan, elapsedSeconds: number): number {
  if (plan.direction === 'up') {
    return elapsedSeconds;
  }
  return Math.max(0, plan.startSeconds - elapsedSeconds);
}

export function hasCountdownFinished(plan: CountdownPlan, elapsedSeconds: number): boolean {
  return plan.direction === 'down' && elapsedSeconds >= plan.startSeconds;
}

export function recordedCountdownSeconds(plan: CountdownPlan, elapsedSeconds: number): number {
  if (plan.direction === 'down') {
    return Math.min(elapsedSeconds, plan.startSeconds);
  }
  return elapsedSeconds;
}
