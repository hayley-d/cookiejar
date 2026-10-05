import type { SQLiteDatabase } from 'expo-sqlite';

import { buildCoachSnapshot, coachSnapshotDateRanges } from '@/coach/buildCoachSnapshot';
import type { CoachSnapshot } from '@/coach/CoachSnapshot';
import { getLatestBodyMeasurement } from '@/database/repositories/bodyMeasurementRepository';
import { listExercises } from '@/database/repositories/exerciseRepository';
import { getHealthSnapshotsBetween } from '@/database/repositories/healthSnapshotRepository';
import { getActivePlanWithEntries } from '@/database/repositories/planRepository';
import { getProfile } from '@/database/repositories/profileRepository';
import { getTrainingTotals, listAllFinishedSessionSets } from '@/database/repositories/progressRepository';
import { listSessionsBetween } from '@/database/repositories/scheduleRepository';

export async function loadCoachSnapshot(database: SQLiteDatabase, now: Date): Promise<CoachSnapshot> {
  const dateRanges = coachSnapshotDateRanges(now);
  const [
    profile,
    activePlan,
    lifetimeTotals,
    finishedSessionSets,
    scheduledSessions,
    healthSnapshots,
    latestBodyMeasurement,
    exercises,
  ] = await Promise.all([
    getProfile(database),
    getActivePlanWithEntries(database),
    getTrainingTotals(database, null, dateRanges.today),
    listAllFinishedSessionSets(database),
    listSessionsBetween(database, dateRanges.scheduleStartDate, dateRanges.weekEndDate),
    getHealthSnapshotsBetween(database, dateRanges.recentStartDate, dateRanges.today),
    getLatestBodyMeasurement(database),
    listExercises(database),
  ]);
  return buildCoachSnapshot({
    now,
    profile,
    activePlan,
    finishedSessionCount: lifetimeTotals.workoutCount,
    finishedSessionSets,
    scheduledSessions,
    healthSnapshots,
    latestBodyMeasurement,
    exercises,
  });
}
