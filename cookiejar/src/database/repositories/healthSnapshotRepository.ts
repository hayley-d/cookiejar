import type { SQLiteDatabase } from 'expo-sqlite';

import type { DailyHealth } from '@/health/HealthTypes';
import type { HealthSnapshot } from '@/types/HealthSnapshot';

type HealthSnapshotRow = {
  date: string;
  steps: number | null;
  sleep_minutes: number | null;
  resting_heart_rate: number | null;
  fetched_at: string;
};

function toHealthSnapshot(row: HealthSnapshotRow): HealthSnapshot {
  return {
    date: row.date,
    steps: row.steps,
    sleepMinutes: row.sleep_minutes,
    restingHeartRate: row.resting_heart_rate,
    fetchedAt: row.fetched_at,
  };
}

export async function getHealthSnapshot(database: SQLiteDatabase, date: string): Promise<HealthSnapshot | null> {
  const row = await database.getFirstAsync<HealthSnapshotRow>(
    'SELECT date, steps, sleep_minutes, resting_heart_rate, fetched_at FROM health_snapshots WHERE date = ?',
    date,
  );
  return row ? toHealthSnapshot(row) : null;
}

export async function getHealthSnapshotsBetween(
  database: SQLiteDatabase,
  startDate: string,
  endDate: string,
): Promise<HealthSnapshot[]> {
  const rows = await database.getAllAsync<HealthSnapshotRow>(
    `SELECT date, steps, sleep_minutes, resting_heart_rate, fetched_at
     FROM health_snapshots
     WHERE date BETWEEN ? AND ?
     ORDER BY date`,
    startDate,
    endDate,
  );
  return rows.map(toHealthSnapshot);
}

export async function upsertHealthSnapshot(
  database: SQLiteDatabase,
  dailyHealth: DailyHealth,
): Promise<HealthSnapshot> {
  const fetchedAt = new Date().toISOString();
  await database.runAsync(
    `INSERT INTO health_snapshots (date, steps, sleep_minutes, resting_heart_rate, fetched_at)
     VALUES (?, ?, ?, ?, ?)
     ON CONFLICT(date) DO UPDATE SET
       steps = excluded.steps,
       sleep_minutes = excluded.sleep_minutes,
       resting_heart_rate = excluded.resting_heart_rate,
       fetched_at = excluded.fetched_at`,
    dailyHealth.date,
    dailyHealth.steps,
    dailyHealth.sleepMinutes,
    dailyHealth.restingHeartRate,
    fetchedAt,
  );
  return { ...dailyHealth, fetchedAt };
}
