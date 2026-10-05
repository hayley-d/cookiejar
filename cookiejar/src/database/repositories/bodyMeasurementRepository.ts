import type { SQLiteDatabase } from 'expo-sqlite';

import type { BodyMeasurement, BodyMeasurementInput, WeightMeasurement } from '@/types/BodyMeasurement';

type BodyMeasurementRow = {
  id: number;
  measured_on: string;
  weight_kilograms: number | null;
  body_fat_percent: number | null;
  waist_centimetres: number | null;
  hip_centimetres: number | null;
  chest_centimetres: number | null;
  notes: string | null;
};

type WeightRow = {
  measured_on: string;
  weight_kilograms: number;
};

const bodyMeasurementColumns = `id, measured_on, weight_kilograms, body_fat_percent, waist_centimetres,
            hip_centimetres, chest_centimetres, notes`;

function toBodyMeasurement(row: BodyMeasurementRow): BodyMeasurement {
  return {
    id: row.id,
    measuredOn: row.measured_on,
    weightKilograms: row.weight_kilograms,
    bodyFatPercent: row.body_fat_percent,
    waistCentimetres: row.waist_centimetres,
    hipCentimetres: row.hip_centimetres,
    chestCentimetres: row.chest_centimetres,
    notes: row.notes,
  };
}

export async function listBodyMeasurements(database: SQLiteDatabase): Promise<BodyMeasurement[]> {
  const rows = await database.getAllAsync<BodyMeasurementRow>(
    `SELECT ${bodyMeasurementColumns}
     FROM body_measurements
     ORDER BY measured_on DESC, id DESC`,
  );
  return rows.map(toBodyMeasurement);
}

export async function addBodyMeasurement(database: SQLiteDatabase, input: BodyMeasurementInput): Promise<number> {
  const result = await database.runAsync(
    `INSERT INTO body_measurements (measured_on, weight_kilograms, body_fat_percent, waist_centimetres,
                                    hip_centimetres, chest_centimetres, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    input.measuredOn,
    input.weightKilograms,
    input.bodyFatPercent,
    input.waistCentimetres,
    input.hipCentimetres,
    input.chestCentimetres,
    input.notes,
  );
  return result.lastInsertRowId;
}

export async function deleteBodyMeasurement(database: SQLiteDatabase, bodyMeasurementId: number): Promise<void> {
  await database.runAsync('DELETE FROM body_measurements WHERE id = ?', bodyMeasurementId);
}

export async function getLatestBodyMeasurement(database: SQLiteDatabase): Promise<BodyMeasurement | null> {
  const row = await database.getFirstAsync<BodyMeasurementRow>(
    `SELECT ${bodyMeasurementColumns}
     FROM body_measurements
     ORDER BY measured_on DESC, id DESC
     LIMIT 1`,
  );
  return row ? toBodyMeasurement(row) : null;
}

export async function listWeightsBetween(
  database: SQLiteDatabase,
  startDate: string,
  endDate: string,
): Promise<WeightMeasurement[]> {
  const rows = await database.getAllAsync<WeightRow>(
    `SELECT measured_on, weight_kilograms
     FROM body_measurements
     WHERE weight_kilograms IS NOT NULL AND measured_on >= ? AND measured_on <= ?
     ORDER BY measured_on ASC, id ASC`,
    startDate,
    endDate,
  );
  return rows.map((row) => ({ measuredOn: row.measured_on, weightKilograms: row.weight_kilograms }));
}
