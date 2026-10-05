import { addDays } from '@/dates/addDays';
import { parseLocalDateString } from '@/dates/parseLocalDateString';
import { toLocalDateString } from '@/dates/toLocalDateString';

const finalisingHourOnFollowingDay = 12;

export function isHealthSnapshotFinal(snapshot: { date: string; fetchedAt: string }, now: Date): boolean {
  if (snapshot.date >= toLocalDateString(now)) {
    return false;
  }
  const followingDay = addDays(parseLocalDateString(snapshot.date), 1);
  followingDay.setHours(finalisingHourOnFollowingDay, 0, 0, 0);
  return new Date(snapshot.fetchedAt).getTime() > followingDay.getTime();
}
