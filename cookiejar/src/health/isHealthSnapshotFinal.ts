import { addDays } from '@/dates/addDays';
import { parseLocalDateString } from '@/dates/parseLocalDateString';
import { toLocalDateString } from '@/dates/toLocalDateString';
import type { HealthSnapshot } from '@/types/HealthSnapshot';

const finalisingHourOnFollowingDay = 12;

export function isHealthSnapshotFinal(snapshot: HealthSnapshot, now: Date): boolean {
  if (snapshot.steps === null && snapshot.sleepMinutes === null && snapshot.restingHeartRate === null) {
    return false;
  }
  if (snapshot.date >= toLocalDateString(now)) {
    return false;
  }
  const followingDay = addDays(parseLocalDateString(snapshot.date), 1);
  followingDay.setHours(finalisingHourOnFollowingDay, 0, 0, 0);
  return new Date(snapshot.fetchedAt).getTime() > followingDay.getTime();
}
