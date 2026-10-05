import type { DailyHealth } from '@/health/HealthTypes';

export function shouldShowHealthAccessHint(
  hasRequestedAuthorization: boolean | null,
  snapshot: DailyHealth | null,
): boolean {
  if (hasRequestedAuthorization !== true || snapshot === null) {
    return false;
  }
  return snapshot.steps === null && snapshot.sleepMinutes === null && snapshot.restingHeartRate === null;
}
