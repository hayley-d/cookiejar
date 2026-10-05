import type { SQLiteDatabase } from 'expo-sqlite';

import { planCopyDay } from '@/plans/planCopyDay';
import type { ClassType } from '@/types/ClassType';
import type { Plan } from '@/types/Plan';
import type { PlanSummary } from '@/types/PlanSummary';
import type { PlanEntryWithWorkout, PlanWithEntries } from '@/types/PlanWithEntries';
import type { WorkoutKind } from '@/types/WorkoutKind';

type PlanRow = {
  id: number;
  name: string;
  is_active: number;
  starts_on: string | null;
  created_at: string;
};

type PlanSummaryRow = PlanRow & {
  entry_count: number;
};

type PlanEntryWithWorkoutRow = {
  id: number;
  plan_id: number;
  workout_id: number;
  day_of_week: number;
  time_of_day: string;
  workout_name: string;
  workout_kind: WorkoutKind;
  workout_class_type: ClassType | null;
  workout_duration_minutes: number | null;
  workout_image_url: string | null;
  workout_exercise_count: number;
};

export type NewPlanEntry = {
  planId: number;
  workoutId: number;
  dayOfWeek: number;
  timeOfDay: string;
};

function toPlan(row: PlanRow): Plan {
  return {
    id: row.id,
    name: row.name,
    isActive: row.is_active === 1,
    startsOn: row.starts_on,
    createdAt: row.created_at,
  };
}

function toPlanEntryWithWorkout(row: PlanEntryWithWorkoutRow): PlanEntryWithWorkout {
  return {
    id: row.id,
    planId: row.plan_id,
    workoutId: row.workout_id,
    dayOfWeek: row.day_of_week,
    timeOfDay: row.time_of_day,
    workout: {
      id: row.workout_id,
      name: row.workout_name,
      kind: row.workout_kind,
      classType: row.workout_class_type,
      durationMinutes: row.workout_duration_minutes,
      imageUrl: row.workout_image_url,
      exerciseCount: row.workout_exercise_count,
    },
  };
}

export async function listPlans(database: SQLiteDatabase): Promise<PlanSummary[]> {
  const rows = await database.getAllAsync<PlanSummaryRow>(
    `SELECT plans.id, plans.name, plans.is_active, plans.starts_on, plans.created_at,
      COUNT(plan_entries.id) AS entry_count
    FROM plans
    LEFT JOIN plan_entries ON plan_entries.plan_id = plans.id
    GROUP BY plans.id
    ORDER BY plans.is_active DESC, plans.created_at DESC, plans.id DESC`,
  );
  return rows.map((row) => ({ ...toPlan(row), entryCount: row.entry_count }));
}

export async function getPlanWithEntries(database: SQLiteDatabase, planId: number): Promise<PlanWithEntries | null> {
  const planRow = await database.getFirstAsync<PlanRow>(
    'SELECT id, name, is_active, starts_on, created_at FROM plans WHERE id = ?',
    planId,
  );
  if (planRow === null) {
    return null;
  }

  const entryRows = await database.getAllAsync<PlanEntryWithWorkoutRow>(
    `SELECT plan_entries.id, plan_entries.plan_id, plan_entries.workout_id, plan_entries.day_of_week,
      plan_entries.time_of_day,
      workouts.name AS workout_name, workouts.kind AS workout_kind, workouts.class_type AS workout_class_type,
      workouts.duration_minutes AS workout_duration_minutes, workouts.image_url AS workout_image_url,
      (SELECT COUNT(*) FROM workout_items WHERE workout_items.workout_id = workouts.id) AS workout_exercise_count
    FROM plan_entries
    JOIN workouts ON workouts.id = plan_entries.workout_id
    WHERE plan_entries.plan_id = ?
    ORDER BY plan_entries.day_of_week, plan_entries.time_of_day, plan_entries.id`,
    planId,
  );

  return { ...toPlan(planRow), entries: entryRows.map(toPlanEntryWithWorkout) };
}

export async function createPlan(database: SQLiteDatabase, name: string): Promise<number> {
  const result = await database.runAsync(
    'INSERT INTO plans (name, is_active, starts_on, created_at) VALUES (?, 0, NULL, ?)',
    name,
    new Date().toISOString(),
  );
  return result.lastInsertRowId;
}

export async function addPlanEntry(
  database: SQLiteDatabase,
  { planId, workoutId, dayOfWeek, timeOfDay }: NewPlanEntry,
): Promise<number> {
  const result = await database.runAsync(
    'INSERT INTO plan_entries (plan_id, workout_id, day_of_week, time_of_day) VALUES (?, ?, ?, ?)',
    planId,
    workoutId,
    dayOfWeek,
    timeOfDay,
  );
  return result.lastInsertRowId;
}

export async function updatePlanEntryTime(
  database: SQLiteDatabase,
  planEntryId: number,
  timeOfDay: string,
): Promise<void> {
  await database.runAsync('UPDATE plan_entries SET time_of_day = ? WHERE id = ?', timeOfDay, planEntryId);
}

export async function removePlanEntry(database: SQLiteDatabase, planEntryId: number): Promise<void> {
  await database.runAsync('DELETE FROM plan_entries WHERE id = ?', planEntryId);
}

type CopyableEntryRow = {
  day_of_week: number;
  workout_id: number;
  time_of_day: string;
};

export async function copyDayEntries(
  database: SQLiteDatabase,
  planId: number,
  fromDayOfWeek: number,
  toDaysOfWeek: readonly number[],
): Promise<number> {
  let copiedEntryCount = 0;

  await database.withTransactionAsync(async () => {
    const rows = await database.getAllAsync<CopyableEntryRow>(
      'SELECT day_of_week, workout_id, time_of_day FROM plan_entries WHERE plan_id = ?',
      planId,
    );
    const toCopyableEntry = (row: CopyableEntryRow) => ({ workoutId: row.workout_id, timeOfDay: row.time_of_day });
    const sourceEntries = rows.filter((row) => row.day_of_week === fromDayOfWeek).map(toCopyableEntry);
    const targets = toDaysOfWeek.map((dayOfWeek) => ({
      dayOfWeek,
      existingEntries: rows.filter((row) => row.day_of_week === dayOfWeek).map(toCopyableEntry),
    }));

    const plannedInserts = planCopyDay(sourceEntries, fromDayOfWeek, targets);
    for (const plannedInsert of plannedInserts) {
      await database.runAsync(
        'INSERT INTO plan_entries (plan_id, workout_id, day_of_week, time_of_day) VALUES (?, ?, ?, ?)',
        planId,
        plannedInsert.workoutId,
        plannedInsert.dayOfWeek,
        plannedInsert.timeOfDay,
      );
    }
    copiedEntryCount = plannedInserts.length;
  });

  return copiedEntryCount;
}

export async function renamePlan(database: SQLiteDatabase, planId: number, name: string): Promise<void> {
  await database.runAsync('UPDATE plans SET name = ? WHERE id = ?', name, planId);
}

export async function duplicatePlan(database: SQLiteDatabase, planId: number): Promise<number> {
  let duplicatedPlanId = 0;

  await database.withTransactionAsync(async () => {
    const planResult = await database.runAsync(
      `INSERT INTO plans (name, is_active, starts_on, created_at)
      SELECT name || ' (copy)', 0, NULL, ? FROM plans WHERE id = ?`,
      new Date().toISOString(),
      planId,
    );
    if (planResult.changes === 0) {
      throw new Error('The plan to duplicate no longer exists');
    }
    duplicatedPlanId = planResult.lastInsertRowId;

    await database.runAsync(
      `INSERT INTO plan_entries (plan_id, workout_id, day_of_week, time_of_day)
      SELECT ?, workout_id, day_of_week, time_of_day FROM plan_entries WHERE plan_id = ?`,
      duplicatedPlanId,
      planId,
    );
  });

  return duplicatedPlanId;
}

export async function deletePlan(database: SQLiteDatabase, planId: number): Promise<void> {
  await database.runAsync('DELETE FROM plans WHERE id = ?', planId);
}

export async function setActivePlan(database: SQLiteDatabase, planId: number, startsOn: string): Promise<void> {
  await database.withTransactionAsync(async () => {
    await database.runAsync('UPDATE plans SET is_active = 0');
    const result = await database.runAsync(
      'UPDATE plans SET is_active = 1, starts_on = ? WHERE id = ?',
      startsOn,
      planId,
    );
    if (result.changes === 0) {
      throw new Error('The plan to activate no longer exists');
    }
  });
}

export async function deactivatePlan(database: SQLiteDatabase): Promise<void> {
  await database.runAsync('UPDATE plans SET is_active = 0');
}

export async function getActivePlanWithEntries(database: SQLiteDatabase): Promise<PlanWithEntries | null> {
  const activePlanRow = await database.getFirstAsync<{ id: number }>('SELECT id FROM plans WHERE is_active = 1');
  if (activePlanRow === null) {
    return null;
  }
  return getPlanWithEntries(database, activePlanRow.id);
}
